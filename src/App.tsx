import { useEffect, useState } from 'react';
import './App.scss';
import {
	potentialClientGenerator,
	managerFilter,
	CarDealershipStorage,
	ClientOrder,
	getRandomNumberBetween,
	pricesOfCars,
	lastDaysOfShipment,
	MoscowStorage,
	HankoStorage,
} from './model/functions';
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

// Выбор случайной машины
const carSelector = () => {
	const carId = getRandomNumberBetween(1, 4);
	switch (carId) {
		case 1:
			return pricesOfCars.Impreza;
		case 2:
			return pricesOfCars.Forester;
		case 3:
			return pricesOfCars.Outback;
		default:
			return pricesOfCars.Solterra;
	}
};

// Выбор случайного склада где она в наличии
const storageSelector = () => {
	const carId = getRandomNumberBetween(1, 10);
	switch (carId) {
		case 1:
		case 2:
		case 3:
			return 1;
		case 4:
		case 5:
		case 6:
			return 2;
		case 7:
			return 3;
		default:
			return 4;
	}
};
// Выбор случайного склада где машина в наличии, если склады автосалонов пусты
const storageSelectorIfDealeshipStorageIsEmpty = () => {
	const carId = getRandomNumberBetween(1, 4);
	switch (carId) {
		case 1:
			return 3;

		default:
			return 4;
	}
};

// Генерация предоплаты
const prepaymentGenerator = (carPrice: number, minSum: number): number => {
	const carPriceThousands = carPrice / 1000;
	const minSumThosands = minSum / 1000;

	const prepayment = getRandomNumberBetween(minSumThosands, carPriceThousands);
	console.log('prepayment generator');
	console.log(carPriceThousands, minSumThosands, prepayment);
	return prepayment * 1000;
};

// Выбор крайнего срока в зависимости от склада
const selectLastDayOfShipment = (storageId: number) => {
	switch (storageId) {
		case 1:
		case 2:
			return lastDaysOfShipment.Dealership;
		case 3:
			return lastDaysOfShipment.MoscowStorage;
		default:
			return lastDaysOfShipment.Factory;
	}
};

interface dataForGraphI {
	data: number;
	day: number;
}
let totalClients = 0;
let dataForGraphProfit: dataForGraphI[] = [];
let dataForGraphExpenses: dataForGraphI[] = [];
let dataForGraphTotalProfit: dataForGraphI[] = [];
let dataForGraphStorageMonthlyPaymentTotal: dataForGraphI[] = [];
let dataForGraphNumberOfCarsInStorage1: dataForGraphI[] = [];
let dataForGraphNumberOfCarsInStorage2: dataForGraphI[] = [];
let totalSum = 0;
let totalExpenses = -1000000;
const STORAGE_MONTHLY_PAYMENT = 6000;
const DAYS_IN_MONTH = 30;
let orderId = 0;
const hankoStorage = new HankoStorage(10, 15);
const moscowStorage = new MoscowStorage(5, 5);
const carDealership1 = new CarDealershipStorage(8, 3, 4);
const carDealership2 = new CarDealershipStorage(8, 3, 4);

let currentOrdersDealership1 = [];
let currentOrdersDealership2 = [];

//-------------------------------
// Разгрузка погрузчиков, выдача заказов
//-------------------------------

for (let i = 0; i < 200; i++) {
	//-------------------------------
	// Генерация потенциальных клиентов
	//-------------------------------
	const potentialClientsDealership1 = potentialClientGenerator(1, 10);
	const potentialClientsDealership2 = potentialClientGenerator(1, 10);
	console.log('potential clients');
	console.log(potentialClientsDealership1);
	console.log(potentialClientsDealership2);

	//-------------------------------
	// 10% становятся клиентами
	//-------------------------------
	const actualClientsDealership1 = managerFilter(potentialClientsDealership1);
	const actualClientsDealership2 = managerFilter(potentialClientsDealership2);
	console.log('real clients');
	console.log(actualClientsDealership1);
	console.log(actualClientsDealership2);
	totalClients += actualClientsDealership1 + actualClientsDealership2;
	//-------------------------------
	// Генератор заявок для каждого клиента
	//-------------------------------
	for (let j = 0; j < actualClientsDealership1; j++) {
		const selectedCarPrice = carSelector();
		const selectedStorage = storageSelector();
		const order = new ClientOrder(
			orderId,
			selectedCarPrice,
			selectedStorage,
			prepaymentGenerator(selectedCarPrice, selectedCarPrice / 2),
			selectLastDayOfShipment(selectedStorage)
		);

		orderId++;
		currentOrdersDealership1.push(order);
	}
	for (let k = 0; k < actualClientsDealership2; k++) {
		const selectedCarPrice = carSelector();
		const selectedStorage = storageSelector();
		const order = new ClientOrder(
			orderId,
			selectedCarPrice,
			selectedStorage,
			prepaymentGenerator(selectedCarPrice, selectedCarPrice / 2),
			selectLastDayOfShipment(selectedStorage)
		);

		orderId++;
		currentOrdersDealership2.push(order);
	}
	console.log('current orders');
	console.log(currentOrdersDealership1);
	console.log(currentOrdersDealership2);
	//-----------------------------
	// обработка заявок
	//-----------------------------

	currentOrdersDealership1.forEach((order: ClientOrder) => {
		const newOrder = order;
		// если машина на складе автосалона
		if (newOrder.storageId === 2 && carDealership2.numberOfCars == 0) {
			newOrder.storageId = 1;
		}
		if (newOrder.storageId === 1 && carDealership1.numberOfCars == 0) {
			newOrder.storageId = 2;
			if (newOrder.storageId === 2 && carDealership2.numberOfCars == 0) {
				newOrder.storageId = storageSelectorIfDealeshipStorageIsEmpty();
			}
		}

		if (newOrder.storageId === 1) {
			carDealership1.chooseRandomCar();
			carDealership1.addToHankoQue(newOrder.priceOfCar);
			totalSum += newOrder.priceOfCar;
		}
		// если в друом автосалоне
		if (newOrder.storageId === 2) {
			totalSum += newOrder.prepayment;
			carDealership1.addNewOrder(newOrder);
			carDealership2.chooseRandomCar();
			carDealership2.carsToShipmentArray.push({
				orderId: newOrder.orderId,
			});
			carDealership2.addToHankoQue(newOrder.priceOfCar);
		}
		// если на складе в Москве
		if (newOrder.storageId === 3) {
			console.log('storage 3');
			totalSum += newOrder.prepayment;
			totalExpenses += newOrder.priceOfCar * 0.9;
			carDealership1.addNewOrder(newOrder);
			moscowStorage.addCarToShipmentQueToDealership1({
				orderId: newOrder.orderId,
			});
		}
		// если на складе в Ханко
		if (newOrder.storageId === 4) {
			console.log('storage 4');
			totalSum += newOrder.prepayment;
			totalExpenses += newOrder.priceOfCar * 0.8;
			carDealership1.addNewOrder(newOrder);
			hankoStorage.addCarToMainQue({
				isForDealership1: true,
				orderId: newOrder.orderId,
			});
		}
	});

	currentOrdersDealership2.forEach((order: ClientOrder) => {
		const newOrder = order;
		// если машина на складе автосалона
		if (newOrder.storageId === 1 && carDealership1.numberOfCars == 0) {
			newOrder.storageId = 2;
		}
		if (newOrder.storageId === 2 && carDealership2.numberOfCars == 0) {
			newOrder.storageId = 1;
			if (newOrder.storageId === 1 && carDealership1.numberOfCars == 0) {
				newOrder.storageId = storageSelectorIfDealeshipStorageIsEmpty();
			}
		}
		// если машина на складе автосалона
		if (newOrder.storageId === 2) {
			carDealership2.chooseRandomCar();
			carDealership2.addToHankoQue(newOrder.priceOfCar);
			totalSum += newOrder.priceOfCar;
		}
		// если в друом автосалоне
		if (newOrder.storageId === 1) {
			totalSum += newOrder.prepayment;
			carDealership2.addNewOrder(newOrder);
			carDealership1.chooseRandomCar();
			carDealership1.carsToShipmentArray.push({
				orderId: newOrder.orderId,
			});
			carDealership1.addToHankoQue(newOrder.priceOfCar);
		}
		// если на складе в Москве
		if (newOrder.storageId === 3) {
			totalSum += newOrder.prepayment;
			totalExpenses += newOrder.priceOfCar * 0.9;
			carDealership2.addNewOrder(newOrder);
			moscowStorage.addCarToShipmentQueToDealership2({
				orderId: newOrder.orderId,
			});
		}
		// если на складе в Ханко
		if (newOrder.storageId === 4) {
			totalSum += newOrder.prepayment;
			totalExpenses += newOrder.priceOfCar * 0.8;
			carDealership2.addNewOrder(newOrder);
			hankoStorage.addCarToMainQue({
				isForDealership1: false,
				orderId: newOrder.orderId,
			});
		}
	});

	console.log('carDealership1', carDealership1);
	console.log('carDealership2', carDealership2);
	console.log('carDealership1', carDealership1.clientOrdersArray);
	console.log('carDealership2', carDealership2.clientOrdersArray);
	currentOrdersDealership1 = [];
	currentOrdersDealership2 = [];
	//----------------------------
	// Заказ в Ханко для пополнения склада
	//----------------------------
	carDealership1.timeToOrderFromHanko(true, hankoStorage);
	carDealership2.timeToOrderFromHanko(false, hankoStorage);
	//----------------------------
	// Пришла ли доставка
	//----------------------------
	if (hankoStorage.checkIfShipmentArrives()) {
		moscowStorage.shipmentFromHanko(hankoStorage.shipmentQue);
		hankoStorage.unloadCargo();
	}
	if (moscowStorage.checkIfShipmentArrives1()) {
		carDealership1.unloadCarShipment(
			moscowStorage.carsOnTransporterToDealership1Array
		);
		moscowStorage.unloadCargo1();
	}
	if (moscowStorage.checkIfShipmentArrives2()) {
		carDealership2.unloadCarShipment(
			moscowStorage.carsOnTransporterToDealership2Array
		);
		moscowStorage.unloadCargo2();
	}
	if (carDealership1.checkIfShipmentArrives()) {
		carDealership2.unloadCarShipment([carDealership1.carsToShipmentArray[0]]);
		carDealership1.unloadCargo();
	}
	if (carDealership2.checkIfShipmentArrives()) {
		carDealership1.unloadCarShipment([carDealership2.carsToShipmentArray[0]]);
		carDealership2.unloadCargo();
	}

	//----------------------------
	// Работа погрузчиков
	//----------------------------
	carDealership1.isSendCarTransporter();
	carDealership2.isSendCarTransporter();
	hankoStorage.isSendCarTransporter();
	moscowStorage.isSendCarTransporter();

	//----------------------------
	// Прошел ещё один день
	//----------------------------
	hankoStorage.anotherDayPasses();
	moscowStorage.anotherDayPasses();
	carDealership1.anotherDayPasses();
	carDealership2.anotherDayPasses();

	//----------------------------
	// Оплата за хранение машин на складе
	//----------------------------
	carDealership1.storageRentPayment();
	carDealership2.storageRentPayment();
	//----------------------------
	// Прибавляем доходы и расходы салонов к общим
	//----------------------------
	totalExpenses += carDealership1.totalExpenses + carDealership2.totalExpenses;
	carDealership1.totalExpenses = 0;
	carDealership2.totalExpenses = 0;
	totalSum += carDealership1.totalProfit + carDealership2.totalProfit;
	carDealership1.totalProfit = 0;
	carDealership2.totalProfit = 0;
	dataForGraphProfit.push({
		data: totalSum,
		day: i,
	});
	dataForGraphExpenses.push({
		data: totalExpenses,
		day: i,
	});
	dataForGraphTotalProfit.push({
		data: totalSum - totalExpenses,
		day: i,
	});
	dataForGraphStorageMonthlyPaymentTotal.push({
		data:
			carDealership1.storageMonthlyPaymentTotal +
			carDealership2.storageMonthlyPaymentTotal,
		day: i,
	});
	dataForGraphNumberOfCarsInStorage1.push({
		data: carDealership1.numberOfCars,
		day: i,
	});
	dataForGraphNumberOfCarsInStorage2.push({
		data: carDealership2.numberOfCars,
		day: i,
	});
	console.log(moscowStorage);
	console.log(hankoStorage);
	console.log(totalExpenses);
	console.log(totalSum);
	console.log(carDealership1.averageDeliveryTime);
	console.log(carDealership2.averageDeliveryTime);
	console.log(totalClients);
}

function App() {
	const [storageSize, setStorageSize] = useState(2);
	const [orderStrategy, setOrderStrategy] = useState(2);
	const [hankoTransporterSize, setHankoTransporterSize] = useState(3);
	const [moscowTransporterSize, setMoscowTransporterSize] = useState(3);

	useEffect(() => {}, []);
	const onOptionChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		setter: React.Dispatch<React.SetStateAction<number>>
	) => {
		setter(+e.target.value);
	};
	return (
		<div className="main-container">
			<div className="control-container">
				<div className="radio-group">
					<h3>Управление размером склада</h3>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="2"
							id="2"
							checked={storageSize === 2}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="2">2</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="4"
							id="4"
							checked={storageSize === 4}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="4">4</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="6"
							id="6"
							checked={storageSize === 6}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="6">6</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="8"
							id="8"
							checked={storageSize === 8}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="8">8</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="10"
							id="10"
							checked={storageSize === 10}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="10">10</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="12"
							id="12"
							checked={storageSize === 12}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="12">12</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="16"
							id="16"
							checked={storageSize === 16}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="16">16</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="storage"
							value="20"
							id="20"
							checked={storageSize === 20}
							onChange={(e) => {
								onOptionChange(e, setStorageSize);
							}}
						/>
						<label htmlFor="20">20</label>
					</div>
				</div>
				<div className="radio-group">
					<h3>Стратегия заказа авто</h3>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="2"
							id="2"
							checked={orderStrategy === 2}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="2">2</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="4"
							id="4"
							checked={orderStrategy === 4}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="4">4</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="6"
							id="6"
							checked={orderStrategy === 6}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="6">6</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="8"
							id="8"
							checked={orderStrategy === 8}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="8">8</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="10"
							id="10"
							checked={orderStrategy === 10}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="10">10</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="12"
							id="12"
							checked={orderStrategy === 12}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="12">12</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="16"
							id="16"
							checked={orderStrategy === 16}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="16">16</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="strategy"
							value="20"
							id="20"
							checked={orderStrategy === 20}
							onChange={(e) => {
								onOptionChange(e, setOrderStrategy);
							}}
						/>
						<label htmlFor="20">20</label>
					</div>
				</div>
				<div className="radio-group">
					<h3>Размер перевозчика из москвы</h3>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="2"
							id="2"
							checked={moscowTransporterSize === 2}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="2">2</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="4"
							id="4"
							checked={moscowTransporterSize === 4}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="4">4</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="6"
							id="6"
							checked={moscowTransporterSize === 6}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="6">6</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="8"
							id="8"
							checked={moscowTransporterSize === 8}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="8">8</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="10"
							id="10"
							checked={moscowTransporterSize === 10}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="10">10</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="12"
							id="12"
							checked={moscowTransporterSize === 12}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="12">12</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="16"
							id="16"
							checked={moscowTransporterSize === 16}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="16">16</label>
					</div>
					<div className="radio-group__item">
						<input
							type="radio"
							name="moscowTransporter"
							value="20"
							id="20"
							checked={moscowTransporterSize === 20}
							onChange={(e) => {
								onOptionChange(e, setMoscowTransporterSize);
							}}
						/>
						<label htmlFor="20">20</label>
					</div>
				</div>
			</div>
			<div className="graph-container">
				<div className="graph-container__graph">
					<h2>Доходы</h2>
					<ResponsiveContainer width="100%" aspect={4.0 / 3.0}>
						<LineChart
							width={500}
							height={500}
							// @ts-ignore
							data={dataForGraphProfit}
						>
							<Tooltip />
							<Line
								type="monotone"
								dataKey="data"
								stroke="#8884d8"
								dot={true}
							/>
							<XAxis dataKey="day" />
							<YAxis />
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="graph-container__graph">
					<h2>Расходы</h2>
					<ResponsiveContainer width="100%" aspect={4.0 / 3.0}>
						<LineChart
							width={500}
							height={500}
							// @ts-ignore
							data={dataForGraphExpenses}
							margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
						>
							<Tooltip />
							<Line
								type="monotone"
								dataKey="data"
								stroke="#8884d8"
								dot={true}
							/>
							<XAxis dataKey="day" />
							<YAxis />
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="graph-container__graph">
					<h2>Прибыль</h2>
					<ResponsiveContainer width="100%" aspect={4.0 / 3.0}>
						<LineChart
							width={500}
							height={500}
							// @ts-ignore
							data={dataForGraphTotalProfit}
							margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
						>
							<Tooltip />
							<Line
								type="monotone"
								dataKey="data"
								stroke="#8884d8"
								dot={true}
							/>
							<XAxis dataKey="day" />
							<YAxis />
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="graph-container__graph">
					<h2>Ежемесячная плата за хранение</h2>
					<ResponsiveContainer width="100%" aspect={4.0 / 3.0}>
						<LineChart
							width={500}
							height={500}
							// @ts-ignore
							data={dataForGraphStorageMonthlyPaymentTotal}
							margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
						>
							<Tooltip />
							<Line
								type="monotone"
								dataKey="data"
								stroke="#8884d8"
								dot={true}
							/>
							<XAxis dataKey="day" />
							<YAxis />
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="graph-container__graph">
					<h2>Количество машин на складе автосалона 1</h2>
					<ResponsiveContainer width="100%" aspect={4.0 / 3.0}>
						<LineChart
							width={500}
							height={500}
							// @ts-ignore
							data={dataForGraphNumberOfCarsInStorage1}
							margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
						>
							<Tooltip />
							<Line
								type="monotone"
								dataKey="data"
								stroke="#8884d8"
								dot={true}
							/>
							<XAxis dataKey="day" />
							<YAxis />
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="graph-container__graph">
					<h2>Количество машин на складе автосалона 2</h2>
					<ResponsiveContainer width="100%" aspect={4.0 / 3.0}>
						<LineChart
							width={500}
							height={500}
							// @ts-ignore
							data={dataForGraphNumberOfCarsInStorage2}
							margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
						>
							<Tooltip />
							<Line
								type="monotone"
								dataKey="data"
								stroke="#8884d8"
								dot={true}
							/>
							<XAxis dataKey="day" />
							<YAxis />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}

export default App;

// let totalSum = 0;
// let totalExpenses = 0;
// const STORAGE_MONTHLY_PAYMENT = 6000;
// const DAYS_IN_MONTH = 30;

// const carDealership1 = new CarDealershipStorage(3);
// const carDealership2 = new CarDealershipStorage(3);
// let orderId = 0;

// // Выбор случайной машины
// const carSelector = () => {
// 	const carId = getRandomNumberBetween(1, 4);
// 	switch (carId) {
// 		case 1:
// 			return pricesOfCars.Impreza;
// 		case 2:
// 			return pricesOfCars.Forester;
// 		case 3:
// 			return pricesOfCars.Outback;
// 		default:
// 			return pricesOfCars.Solterra;
// 	}
// };
// // Выбор случайной машины со склада
// const chooseRandomCar = (carDealership: CarDealershipStorage) => {
// 	let carToChoose = getRandomNumberBetween(1, carDealership.numberOfCars);
// 	carDealership.numberOfDaysInStorage =
// 		carDealership.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			}
// 			carToChoose--;
// 			if (carToChoose === 0) {
// 				return { payedMonth: 0, daysBeforeShipment: -1 };
// 			}
// 			return numberOfDays;
// 		});
// };
// // Выбор случайного склада где она в наличии
// const storageSelector = () => {
// 	const carId = getRandomNumberBetween(1, 10);
// 	switch (carId) {
// 		case 1:
// 		case 2:yhkh';oop';po'op'op'o'op'op'opiop'io'op'o''op'op'op'op'jkl;kjl;kj;jkl;qwerqwerqwerqwerqwerweqrqwertyityityi
// 		case 3:
// 			return 1;
// 		case 4:
// 		case 5:
// 		case 6:
// 			return 2;
// 		case 7:
// 			return 3;
// 		default:
// 			return 4;
// 	}
// };

// // Генерация предоплаты
// const prepaymentGenerator = (carPrice: number, minSum: number): number => {
// 	const carPriceThousands = carPrice / 1000;
// 	const prepayment = getRandomNumberBetween(minSum, carPriceThousands);
// 	return prepayment * 1000;
// };

// // Выбор крайнего срока в зависимости от склада
// const selectLastDayOfShipment = (storageId: number) => {
// 	switch (storageId) {
// 		case 1:
// 		case 2:
// 			return lastDaysOfShipment.Dealership;
// 		case 3:
// 			return lastDaysOfShipment.MoscowStorage;
// 		default:
// 			return lastDaysOfShipment.Factory;
// 	}
// };
// const daysForAnalysis = 1000;
// for (let i = 0; i < daysForAnalysis; i++) {
// 	// массивы для текущих заявок
// 	const currentOrdersDealership1: ClientOrder[] = [];
// 	const currentOrdersDealership2: ClientOrder[] = [];

// 	//-------------------------------
// 	// Генерация потенциальных клиентов
// 	//-------------------------------
// 	const potentialClientsDealership1 = potentialClientGenerator(1, 11);
// 	const potentialClientsDealership2 = potentialClientGenerator(1, 11);

// 	//-------------------------------
// 	// 10% становятся клиентами
// 	//-------------------------------
// 	const actualClientsDealership1 = managerFilter(potentialClientsDealership1);
// 	const actualClientsDealership2 = managerFilter(potentialClientsDealership2);

// 	//-------------------------------
// 	// Генератор заявок для каждого клиента
// 	//-------------------------------
// 	for (let j = 0; j < actualClientsDealership1; j++) {
// 		const selectedCarPrice = carSelector();
// 		const selectedStorage = storageSelector();
// 		const order = new ClientOrder(
// 			orderId,
// 			selectedCarPrice,
// 			selectedStorage,
// 			prepaymentGenerator(selectedCarPrice, 900),
// 			selectLastDayOfShipment(selectedStorage)
// 		);

// 		orderId++;
// 		currentOrdersDealership1.push(order);
// 	}
// 	for (let k = 0; k < actualClientsDealership2; k++) {
// 		const selectedCarPrice = carSelector();
// 		const selectedStorage = storageSelector();

// 		const order = new ClientOrder(
// 			orderId,
// 			selectedCarPrice,
// 			selectedStorage,
// 			prepaymentGenerator(selectedCarPrice, 900),
// 			selectLastDayOfShipment(selectedStorage)
// 		);

// 		orderId++;
// 		currentOrdersDealership2.push(order);
// 	}

// 	//-------------------------------
// 	// Обработка заявок
// 	//-------------------------------

// 	// Погрузчики между автосалонами
// 	// Проверяем есть ли очередь на погрузчик,
// 	if (carDealership1.carsToShipmentArray.length > 0) {
// 		// добрался ли он до другого автосалона
// 		if (carDealership1.carsToShipmentArray[0].daysBeforeShipment === 0) {
// 			const shipmentId = carDealership1.carsToShipmentArray[0].orderId;
// 			totalSum +=
// 				carDealership2.clientOrdersArray.find(
// 					(order) => order.orderId === shipmentId
// 				)?.postpayment || 0;
// 			carDealership2.clientOrdersArray.filter(
// 				(order) => order.orderId !== shipmentId
// 			);
// 			carDealership1.carsToShipmentArray.shift();
// 		}
// 	}
// 	if (carDealership2.carsToShipmentArray.length > 0) {
// 		if (carDealership2.carsToShipmentArray[0].daysBeforeShipment === 0) {
// 			const shipmentId = carDealership2.carsToShipmentArray[0].orderId;
// 			totalSum +=
// 				carDealership1.clientOrdersArray.find(
// 					(order) => order.orderId === shipmentId
// 				)?.postpayment || 0;
// 			carDealership1.clientOrdersArray.filter(
// 				(order) => order.orderId !== shipmentId
// 			);
// 			carDealership2.carsToShipmentArray.shift();
// 		}
// 	}
// 	currentOrdersDealership1.forEach((order: ClientOrder) => {
// 		// если машина на складе автосалона
// 		if (order.storageId === 1) {
// 			chooseRandomCar(carDealership1);
// 			carDealership1.numberOfCars--;
// 			totalSum += order.prepayment + order.postpayment;
// 		}
// 		// если в друом автосалоне
// 		if (order.storageId === 2) {
// 			totalSum += order.prepayment;
// 			carDealership1.addNewOrder(order);
// 			chooseRandomCar(carDealership2);
// 			carDealership2.carsToShipmentArray.push({
// 				orderId: order.orderId,
// 				daysBeforeShipment: 4,
// 			});
// 		}
// 	});

// 	currentOrdersDealership2.map((order: ClientOrder) => {
// 		if (order.storageId === 2) {
// 			totalSum += order.prepayment + order.postpayment;
// 			return { ...order, orderId: -1 };
// 		}
// 		if (order.storageId === 1) {
// 			totalSum += order.prepayment;
// 			carDealership2.addNewOrder(order);

// 			carDealership1.carsToShipmentArray.push({
// 				orderId: order.orderId,
// 				daysBeforeShipment: 4,
// 			});
// 			return order;
// 		}
// 	});
// 	// Прошел еще один день

// 	//-------------------------------
// 	// Работа погрузчиков
// 	//-------------------------------
// 	if (carDealership1.carsToShipmentArray.length > 0) {
// 		carDealership1.carsToShipmentArray[0].daysBeforeShipment--;
// 	}
// 	if (carDealership2.carsToShipmentArray.length > 0) {
// 		carDealership2.carsToShipmentArray[0].daysBeforeShipment--;
// 	}
// 	//-------------------------------
// 	// Срок хранения на складе увеличивается на 1 день
// 	//-------------------------------
// 	carDealership1.numberOfDaysInStorage =
// 		carDealership1.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				return {
// 					...numberOfDays,
// 					daysBeforeShipment: numberOfDays.daysBeforeShipment + 1,
// 				};
// 			}
// 		});
// 	console.log(carDealership1.numberOfDaysInStorage);

// 	carDealership2.numberOfDaysInStorage =
// 		carDealership2.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				return {
// 					...numberOfDays,
// 					daysBeforeShipment: numberOfDays.daysBeforeShipment + 1,
// 				};
// 			}
// 		});
// 	console.log(carDealership1.numberOfDaysInStorage);
// 	//-------------------------------
// 	// Плата за хранение на складе
// 	//-------------------------------
// 	carDealership1.numberOfDaysInStorage =
// 		carDealership1.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				const monthToPay = Math.floor(
// 					numberOfDays.daysBeforeShipment / DAYS_IN_MONTH
// 				);
// 				if (numberOfDays.payedMonth < monthToPay) {
// 					totalExpenses -= STORAGE_MONTHLY_PAYMENT;
// 					return { ...numberOfDays, payedMonth: numberOfDays.payedMonth + 1 };
// 				} else {
// 					return numberOfDays;
// 				}
// 			}
// 		});

// 	carDealership2.numberOfDaysInStorage =
// 		carDealership2.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				const monthToPay = Math.floor(
// 					numberOfDays.daysBeforeShipment / DAYS_IN_MONTH
// 				);
// 				if (numberOfDays.payedMonth < monthToPay) {
// 					totalExpenses -= STORAGE_MONTHLY_PAYMENT;
// 					return { ...numberOfDays, payedMonth: numberOfDays.payedMonth + 1 };
// 				} else {
// 					return numberOfDays;
// 				}
// 			}
// 		});
// }

// const hankoStorage = new HankoStorage(10, 5);
// hankoStorage.addCarToMainQue({ isForDealership1: true, orderId: 1 });
// hankoStorage.addCarToMainQue({ isForDealership1: false, orderId: 2 });
// hankoStorage.addCarToMainQue({ isForDealership1: false, orderId: 3 });
// hankoStorage.addCarToMainQue({ isForDealership1: false, orderId: 4 });
// hankoStorage.addCarToMainQue({ isForDealership1: true, orderId: 5 });
// hankoStorage.addCarToMainQue({ isForDealership1: true, orderId: 6 });
// console.log(hankoStorage.mainQue);
// console.log(hankoStorage.mainQue[0]);
// console.log(hankoStorage.mainQue);
// hankoStorage.isSendCarTransporter();
// console.log('hanko', hankoStorage.shipmentQue);

// for (let i = 0; i < 15; i++) {
// 	hankoStorage.anotherDayPasses();

// 	console.log(hankoStorage.checkIfShipmentArrives());
// 	console.log(hankoStorage.daysOfShipment);
// 	if (hankoStorage.checkIfShipmentArrives()) {
// 		moscowStorage.shipmentFromHanko(hankoStorage.shipmentQue);
// 		hankoStorage.unloadCargo();
// 		console.log(moscowStorage.shipmentQueToDealership1);
// 		console.log(moscowStorage.shipmentQueToDealership2);
// 	}

// 	console.log(hankoStorage.mainQue);
// 	console.log(hankoStorage.shipmentQue);
// }

// let orderId = 0;

// // Выбор случайной машины
// const carSelector = () => {
// 	const carId = getRandomNumberBetween(1, 4);
// 	switch (carId) {
// 		case 1:
// 			return pricesOfCars.Impreza;
// 		case 2:
// 			return pricesOfCars.Forester;
// 		case 3:
// 			return pricesOfCars.Outback;
// 		default:
// 			return pricesOfCars.Solterra;
// 	}
// };
// // Выбор случайной машины со склада
// const chooseRandomCar = (carDealership: CarDealershipStorage) => {
// 	let carToChoose = getRandomNumberBetween(1, carDealership.numberOfCars);
// 	carDealership.numberOfDaysInStorage =
// 		carDealership.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			}
// 			carToChoose--;
// 			if (carToChoose === 0) {
// 				return { payedMonth: 0, daysBeforeShipment: -1 };
// 			}
// 			return numberOfDays;
// 		});
// };
// // Выбор случайного склада где она в наличии
// const storageSelector = () => {
// 	const carId = getRandomNumberBetween(1, 10);
// 	switch (carId) {
// 		case 1:
// 		case 2:
// 		case 3:
// 			return 1;
// 		case 4:
// 		case 5:
// 		case 6:
// 			return 2;
// 		case 7:
// 			return 3;
// 		default:
// 			return 4;
// 	}
// };

// // Генерация предоплаты
// const prepaymentGenerator = (carPrice: number, minSum: number): number => {
// 	const carPriceThousands = carPrice / 1000;
// 	const prepayment = getRandomNumberBetween(minSum, carPriceThousands);
// 	return prepayment * 1000;
// };

// // Выбор крайнего срока в зависимости от склада
// const selectLastDayOfShipment = (storageId: number) => {
// 	switch (storageId) {
// 		case 1:
// 		case 2:
// 			return lastDaysOfShipment.Dealership;
// 		case 3:
// 			return lastDaysOfShipment.MoscowStorage;
// 		default:
// 			return lastDaysOfShipment.Factory;
// 	}
// };
// const daysForAnalysis = 1000;
// for (let i = 0; i < daysForAnalysis; i++) {
// 	// массивы для текущих заявок
// 	const currentOrdersDealership1: ClientOrder[] = [];
// 	const currentOrdersDealership2: ClientOrder[] = [];

// 	//-------------------------------
// 	// Генерация потенциальных клиентов
// 	//-------------------------------
// 	const potentialClientsDealership1 = potentialClientGenerator(1, 11);
// 	const potentialClientsDealership2 = potentialClientGenerator(1, 11);

// 	//-------------------------------
// 	// 10% становятся клиентами
// 	//-------------------------------
// 	const actualClientsDealership1 = managerFilter(potentialClientsDealership1);
// 	const actualClientsDealership2 = managerFilter(potentialClientsDealership2);

// 	//-------------------------------
// 	// Генератор заявок для каждого клиента
// 	//-------------------------------
// 	for (let j = 0; j < actualClientsDealership1; j++) {
// 		const selectedCarPrice = carSelector();
// 		const selectedStorage = storageSelector();
// 		const order = new ClientOrder(
// 			orderId,
// 			selectedCarPrice,
// 			selectedStorage,
// 			prepaymentGenerator(selectedCarPrice, 900),
// 			selectLastDayOfShipment(selectedStorage)
// 		);

// 		orderId++;
// 		currentOrdersDealership1.push(order);
// 	}
// 	for (let k = 0; k < actualClientsDealership2; k++) {
// 		const selectedCarPrice = carSelector();
// 		const selectedStorage = storageSelector();

// 		const order = new ClientOrder(
// 			orderId,
// 			selectedCarPrice,
// 			selectedStorage,
// 			prepaymentGenerator(selectedCarPrice, 900),
// 			selectLastDayOfShipment(selectedStorage)
// 		);

// 		orderId++;
// 		currentOrdersDealership2.push(order);
// 	}

// 	//-------------------------------
// 	// Обработка заявок
// 	//-------------------------------

// 	// Погрузчики между автосалонами
// 	// Проверяем есть ли очередь на погрузчик,
// 	if (carDealership1.carsToShipmentArray.length > 0) {
// 		// добрался ли он до другого автосалона
// 		if (carDealership1.carsToShipmentArray[0].daysBeforeShipment === 0) {
// 			const shipmentId = carDealership1.carsToShipmentArray[0].orderId;
// 			totalSum +=
// 				carDealership2.clientOrdersArray.find(
// 					(order) => order.orderId === shipmentId
// 				)?.postpayment || 0;
// 			carDealership2.clientOrdersArray.filter(
// 				(order) => order.orderId !== shipmentId
// 			);
// 			carDealership1.carsToShipmentArray.shift();
// 		}
// 	}
// 	if (carDealership2.carsToShipmentArray.length > 0) {
// 		if (carDealership2.carsToShipmentArray[0].daysBeforeShipment === 0) {
// 			const shipmentId = carDealership2.carsToShipmentArray[0].orderId;
// 			totalSum +=
// 				carDealership1.clientOrdersArray.find(
// 					(order) => order.orderId === shipmentId
// 				)?.postpayment || 0;
// 			carDealership1.clientOrdersArray.filter(
// 				(order) => order.orderId !== shipmentId
// 			);
// 			carDealership2.carsToShipmentArray.shift();
// 		}
// 	}
// 	currentOrdersDealership1.forEach((order: ClientOrder) => {
// 		// если машина на складе автосалона
// 		if (order.storageId === 1) {
// 			chooseRandomCar(carDealership1);
// 			carDealership1.numberOfCars--;
// 			totalSum += order.prepayment + order.postpayment;
// 		}
// 		// если в друом автосалоне
// 		if (order.storageId === 2) {
// 			totalSum += order.prepayment;
// 			carDealership1.addNewOrder(order);
// 			chooseRandomCar(carDealership2);
// 			carDealership2.carsToShipmentArray.push({
// 				orderId: order.orderId,
// 				daysBeforeShipment: 4,
// 			});
// 		}
// 	});

// 	currentOrdersDealership2.map((order: ClientOrder) => {
// 		if (order.storageId === 2) {
// 			totalSum += order.prepayment + order.postpayment;
// 			return { ...order, orderId: -1 };
// 		}
// 		if (order.storageId === 1) {
// 			totalSum += order.prepayment;
// 			carDealership2.addNewOrder(order);

// 			carDealership1.carsToShipmentArray.push({
// 				orderId: order.orderId,
// 				daysBeforeShipment: 4,
// 			});
// 			return order;
// 		}
// 	});
// 	// Прошел еще один день

// 	//-------------------------------
// 	// Работа погрузчиков
// 	//-------------------------------
// 	if (carDealership1.carsToShipmentArray.length > 0) {
// 		carDealership1.carsToShipmentArray[0].daysBeforeShipment--;
// 	}
// 	if (carDealership2.carsToShipmentArray.length > 0) {
// 		carDealership2.carsToShipmentArray[0].daysBeforeShipment--;
// 	}
// 	//-------------------------------
// 	// Срок хранения на складе увеличивается на 1 день
// 	//-------------------------------
// 	carDealership1.numberOfDaysInStorage =
// 		carDealership1.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				return {
// 					...numberOfDays,
// 					daysBeforeShipment: numberOfDays.daysBeforeShipment + 1,
// 				};
// 			}
// 		});
// 	console.log(carDealership1.numberOfDaysInStorage);

// 	carDealership2.numberOfDaysInStorage =
// 		carDealership2.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				return {
// 					...numberOfDays,
// 					daysBeforeShipment: numberOfDays.daysBeforeShipment + 1,
// 				};
// 			}
// 		});
// 	console.log(carDealership1.numberOfDaysInStorage);
// 	//-------------------------------
// 	// Плата за хранение на складе
// 	//-------------------------------
// 	carDealership1.numberOfDaysInStorage =
// 		carDealership1.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				const monthToPay = Math.floor(
// 					numberOfDays.daysBeforeShipment / DAYS_IN_MONTH
// 				);
// 				if (numberOfDays.payedMonth < monthToPay) {
// 					totalExpenses -= STORAGE_MONTHLY_PAYMENT;
// 					return { ...numberOfDays, payedMonth: numberOfDays.payedMonth + 1 };
// 				} else {
// 					return numberOfDays;
// 				}
// 			}
// 		});

// 	carDealership2.numberOfDaysInStorage =
// 		carDealership2.numberOfDaysInStorage.map((numberOfDays) => {
// 			if (numberOfDays.daysBeforeShipment === -1) {
// 				return numberOfDays;
// 			} else {
// 				const monthToPay = Math.floor(
// 					numberOfDays.daysBeforeShipment / DAYS_IN_MONTH
// 				);
// 				if (numberOfDays.payedMonth < monthToPay) {
// 					totalExpenses -= STORAGE_MONTHLY_PAYMENT;
// 					return { ...numberOfDays, payedMonth: numberOfDays.payedMonth + 1 };
// 				} else {
// 					return numberOfDays;
// 				}
// 			}
// 		});
// }
