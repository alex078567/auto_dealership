import { useEffect, useState } from 'react';
import './App.css';
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

function App() {
	const moscowStorage = new MoscowStorage(10, 5);
	const hankoStorage = new HankoStorage(10, 5);
	hankoStorage.addCarToMainQue({ isForDealership1: true, orderId: 1 });
	hankoStorage.addCarToMainQue({ isForDealership1: false, orderId: 2 });
	hankoStorage.addCarToMainQue({ isForDealership1: false, orderId: 3 });
	hankoStorage.addCarToMainQue({ isForDealership1: false, orderId: 4 });
	hankoStorage.addCarToMainQue({ isForDealership1: true, orderId: 5 });
	hankoStorage.addCarToMainQue({ isForDealership1: true, orderId: 6 });
	console.log(hankoStorage.mainQue);
	console.log(hankoStorage.mainQue[0]);
	console.log(hankoStorage.mainQue);
	hankoStorage.isSendCarTransporter();
	console.log('hanko', hankoStorage.shipmentQue);

	for (let i = 0; i < 15; i++) {
		hankoStorage.anotherDayPasses();

		console.log(hankoStorage.checkIfShipmentArrives());
		console.log(hankoStorage.daysOfShipment);
		if (hankoStorage.checkIfShipmentArrives()) {
			moscowStorage.shipmentFromHanko(hankoStorage.shipmentQue);
			hankoStorage.unloadCargo();
			console.log(moscowStorage.shipmentQueToDealership1);
			console.log(moscowStorage.shipmentQueToDealership2);
		}

		console.log(hankoStorage.mainQue);
		console.log(hankoStorage.shipmentQue);
	}

	useEffect(() => {});

	return <></>;
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
