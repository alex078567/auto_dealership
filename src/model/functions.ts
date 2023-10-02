// Цены на машины
export enum pricesOfCars {
	Impreza = 2000000,
	Solterra = 4000000,
	Outback = 3500000,
	Forester = 3000000,
}

// Крайний срок поставки
export enum lastDaysOfShipment {
	Dealership = 6,
	MoscowStorage = 15,
	Factory = 45,
}

// Случайное число между (включительно)
export const getRandomNumberBetween = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max + 1 - min) + min);
};

// Генерация потенциальных клиентов
export const potentialClientGenerator = (min: number, max: number): number => {
	return getRandomNumberBetween(min, max);
};

// Потенциальный клиент становится клиентом с вероятностью 10%
export const managerFilter = (potentialClients: number): number => {
	let numberOfClients = 0;
	for (let index = 0; index < potentialClients; index++) {
		if (getRandomNumberBetween(1, 10) === 10) {
			numberOfClients++;
		}
	}
	return numberOfClients;
};

// Выбор случайной машины
export const carSelector = () => {
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
export const storageSelector = () => {
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
export const storageSelectorIfDealeshipStorageIsEmpty = () => {
	const carId = getRandomNumberBetween(1, 4);
	switch (carId) {
		case 1:
			return 3;

		default:
			return 4;
	}
};
// Рассчитать предоплату
export const countPrepayment = (
	prepaymentSize: string,
	selectedCarPrice: number
): number => {
	switch (prepaymentSize) {
		case '20':
			return prepaymentGenerator(selectedCarPrice, selectedCarPrice * 0.2);
		case '40':
			return prepaymentGenerator(selectedCarPrice, selectedCarPrice * 0.4);
		case '50':
			return prepaymentGenerator(selectedCarPrice, selectedCarPrice * 0.5);
		case '60':
			return prepaymentGenerator(selectedCarPrice, selectedCarPrice * 0.6);
		case '80':
			return prepaymentGenerator(selectedCarPrice, selectedCarPrice * 0.8);

		default:
			return prepaymentGenerator(selectedCarPrice, 900000);
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
export const selectLastDayOfShipment = (storageId: number) => {
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

// Класс заказ клиента
export class ClientOrder {
	// Время пока идет доставка
	public daysOfShipment: number = 0;
	// Постоплата
	public postpayment: number = 0;
	constructor(
		// Id заказа
		public orderId: number,
		// Цена машины
		public priceOfCar: number,
		// Склад с которого поставка
		public storageId: number,
		// Предоплата
		public prepayment: number,
		// Крайний срок доставки
		public lastDayForShipment: number
	) {
		this.postpayment = priceOfCar - prepayment;
	}
	// Проходит день
	anotherDayPasses() {
		this.daysOfShipment++;
	}
	// Пришел заказ, рассчитать постоплату
	countTheTotalPostpaymentSum() {
		const differenceBetweenDays = this.daysOfShipment - this.lastDayForShipment;
		if (differenceBetweenDays > 0) {
			return this.postpayment - differenceBetweenDays * 0.01 * this.priceOfCar;
		}
		return this.postpayment;
	}
}

// Интерфейс для структуры данных "машины для отправки"
interface carsToShipmentI {
	orderId: number;
}

// Интерфейс расширяет предыдущий, добавляя новое поле
interface carsToShipmentFromHankoI extends carsToShipmentI {
	isForDealership1?: boolean;
}

// Интерфейс для структуры данных "Количество дней на складе"
interface numberOfDaysInStorageI {
	payedMonth: number;
	daysBeforeShipment: number;
}
// Класс автосалон
export class CarDealershipStorage {
	// Доход магазина
	public totalProfit: number = 0;
	// Расходы магазина
	public totalExpenses: number = 0;
	// Текущее количество на складе
	public numberOfCars: number;
	// Количество дней хранения на складе для каждой машины
	public numberOfDaysInStorage: numberOfDaysInStorageI[];
	// Очередь заказов
	public clientOrdersArray: ClientOrder[];
	// Очередь на доставку в другой салон
	public carsToShipmentArray: carsToShipmentI[] = [];
	// Количество машин после которого можно сделать заказ на складе
	public orderToHankoStrategy: number;
	// Время доставки машины в другой автосалон
	public deliveryTime: number;
	// Время погрузчика в пути
	public daysOfShipment = 0;
	// Количество дней в месяце
	public daysInMonth = 30;
	// Общее количество дней в доставке
	private totalNumberOfDaysInDelivery = 0;

	// Общее количество доставленных машин
	private totalNumbersOfDeliveredCars = 0;
	// Среднее время доставки
	public averageDeliveryTime = 0;
	// Общая сумма оплаты за хранение машин на складе
	public storageMonthlyPaymentTotal = 0;
	// Сумма, которую надо платить за один месяц хранения машины
	public storageMonthlyPayment = 6000;
	// Едет ли погрузчик в другой салон?
	public isCarTransporterOnRoute = false;
	// Заказ в Ханко
	public orderToHanko: number[] = [];
	// Конструктор (размер склада, заказ в ханко)
	constructor(
		// Максимальный размер склада
		private maxStorageSize: number,
		// Стратегия заказа в Ханко
		orderToHankoStrategy: number,
		// Время доставки (до другого салона)
		deliveryTime: number
	) {
		this.deliveryTime = deliveryTime;
		this.orderToHankoStrategy = orderToHankoStrategy;
		this.numberOfCars = maxStorageSize;
		this.numberOfDaysInStorage = Array(maxStorageSize).fill({
			payedMonth: 0,
			daysBeforeShipment: 0,
		});
		this.clientOrdersArray = [];
	}
	// Рассчитать оплату за хранение
	public storageRentPayment() {
		this.numberOfDaysInStorage = this.numberOfDaysInStorage.map(
			(numberOfDays) => {
				if (numberOfDays.daysBeforeShipment === -1) {
					return numberOfDays;
				} else {
					const monthToPay = Math.floor(
						numberOfDays.daysBeforeShipment / this.daysInMonth
					);
					if (numberOfDays.payedMonth < monthToPay) {
						this.totalExpenses += this.storageMonthlyPayment;
						this.storageMonthlyPaymentTotal += this.storageMonthlyPayment;
						return { ...numberOfDays, payedMonth: numberOfDays.payedMonth + 1 };
					} else {
						return numberOfDays;
					}
				}
			}
		);
	}
	// Заказ в Ханко, если пришло время
	public timeToOrderFromHanko(
		isForDealership1: boolean,
		hankoStorage: HankoStorage
	) {
		if (this.orderToHankoStrategy <= this.orderToHanko.length) {
			this.orderToHanko.forEach((price) => {
				this.totalExpenses += price * 0.8;

				hankoStorage.addCarToMainQue({
					isForDealership1,
					orderId: -10,
				});
			});
			this.orderToHanko = [];
		}
	}
	// Разгрузить автомобили
	public unloadCarShipment(cars: carsToShipmentI[]) {
		let newClientOrders = this.clientOrdersArray;
		let allCarsToStorage = cars.filter((car) => {
			return car.orderId === -10;
		}).length;
		cars.forEach((car) => {
			if (car.orderId !== -10) {
				newClientOrders = newClientOrders.filter((clientOrder) => {
					if (car.orderId === clientOrder.orderId) {
						this.totalProfit += clientOrder.countTheTotalPostpaymentSum();
						if (clientOrder.storageId !== 1 && clientOrder.storageId !== 2) {
							this.totalNumberOfDaysInDelivery += clientOrder.daysOfShipment;
							this.totalNumbersOfDeliveredCars += 1;
							this.averageDeliveryTime =
								this.totalNumberOfDaysInDelivery /
								this.totalNumbersOfDeliveredCars;
						}
					}
					return clientOrder.orderId !== car.orderId;
				});
				this.clientOrdersArray = newClientOrders;
			} else {
				this.numberOfDaysInStorage = this.numberOfDaysInStorage.map(
					(numberOfDays) => {
						if (
							numberOfDays.daysBeforeShipment === -1 &&
							allCarsToStorage > 0
						) {
							allCarsToStorage--;
							this.numberOfCars++;
							return { payedMonth: 0, daysBeforeShipment: 0 };
						}

						return numberOfDays;
					}
				);
			}
		});
	}
	// Проверить не дошел ли погрузчик до другого салона?
	public checkIfShipmentArrives() {
		if (this.deliveryTime === this.daysOfShipment) {
			return true;
		}
		return false;
	}
	// Выгрузить машины из автопогрузчика
	public unloadCargo() {
		this.carsToShipmentArray.shift();
		this.isCarTransporterOnRoute = false;
		this.daysOfShipment = 0;
	}
	// Выбираем случайную машину из автосалона
	public chooseRandomCar() {
		let carToChoose = getRandomNumberBetween(1, this.numberOfCars);
		this.numberOfDaysInStorage = this.numberOfDaysInStorage.map(
			(numberOfDays) => {
				if (numberOfDays.daysBeforeShipment === -1) {
					return numberOfDays;
				}
				carToChoose--;
				if (carToChoose === 0) {
					return { payedMonth: 0, daysBeforeShipment: -1 };
				}
				return numberOfDays;
			}
		);
		this.numberOfCars--;
	}
	// Добавить в очередь на заказ в Ханко
	public addToHankoQue(price: number) {
		this.orderToHanko.push(price);
	}
	// Проверка можно ли отправить автопогрузчик в другой салон
	public isSendCarTransporter() {
		if (!this.isCarTransporterOnRoute && this.carsToShipmentArray.length > 0) {
			this.totalExpenses += 15000;
			this.isCarTransporterOnRoute = true;
		}
	}
	// Прошел еще один день
	public anotherDayPasses() {
		if (this.isCarTransporterOnRoute) {
			this.daysOfShipment++;
		}
		this.clientOrdersArray.map((clientOrder) => {
			return clientOrder.anotherDayPasses();
		});
		this.numberOfDaysInStorage = this.numberOfDaysInStorage.map(
			(numberOfDays) => {
				if (numberOfDays.daysBeforeShipment === -1) {
					return numberOfDays;
				} else {
					return {
						...numberOfDays,
						daysBeforeShipment: numberOfDays.daysBeforeShipment + 1,
					};
				}
			}
		);
	}
	// Добавить новый заказ
	public addNewOrder(clientOrder: ClientOrder) {
		this.clientOrdersArray.push(clientOrder);
	}
}

// Класс "склад в Москве"
export class MoscowStorage {
	// Минимальный размер очереди на доставку
	public minCapacityForShipment: number;
	// Время, за которое происходит доставка
	public deliveryTime: number;
	// Автовоз едет в первый автосалон
	public isCarTransporterOnRoute1 = false;
	// Его время в пути
	public daysOfShipment1 = 0;
	// Автовоз едет во второй автосалон
	public isCarTransporterOnRoute2 = false;
	// Его время в пути
	public daysOfShipment2 = 0;
	// Машины на первом автовозе
	public carsOnTransporterToDealership1Array: carsToShipmentI[] = [];
	// Машины на втором автовозе
	public carsOnTransporterToDealership2Array: carsToShipmentI[] = [];
	// Очередь на отправку (не поставку)
	// Очередь в первый салон
	public shipmentQueToDealership1: carsToShipmentI[] = [];
	// Очередь во второй салон
	public shipmentQueToDealership2: carsToShipmentI[] = [];
	constructor(deliveryTime: number, minCapacityForShipment: number) {
		this.deliveryTime = deliveryTime;
		this.minCapacityForShipment = minCapacityForShipment;
	}
	// Добавить машины в очередь в первый салон
	public addCarToShipmentQueToDealership1(car: carsToShipmentI) {
		this.shipmentQueToDealership1.push(car);
	}
	// Добавить машины в очередь во второй салон
	public addCarToShipmentQueToDealership2(car: carsToShipmentI) {
		this.shipmentQueToDealership2.push(car);
	}
	// Поставка из ханко
	public shipmentFromHanko(shipment: carsToShipmentFromHankoI[]) {
		shipment.forEach((car) => {
			if (car.isForDealership1) {
				const newCar = car;
				delete newCar.isForDealership1;
				this.shipmentQueToDealership1.push(newCar);
			} else {
				const newCar = car;
				delete newCar.isForDealership1;
				this.shipmentQueToDealership2.push(newCar);
			}
		});
	}
	// Проверка - отправить ли автопогрузчик в один из салонов?
	// отправка если это так
	public isSendCarTransporter() {
		if (!this.isCarTransporterOnRoute1) {
			if (this.shipmentQueToDealership1.length > this.minCapacityForShipment) {
				this.carsOnTransporterToDealership1Array.push(
					...this.shipmentQueToDealership1.splice(
						0,
						this.minCapacityForShipment + 1
					)
				);
				this.isCarTransporterOnRoute1 = true;
				return;
			}
			if (
				this.shipmentQueToDealership1.length >
				this.minCapacityForShipment - 1
			) {
				this.carsOnTransporterToDealership1Array.push(
					...this.shipmentQueToDealership1.splice(
						0,
						this.minCapacityForShipment
					)
				);
				this.isCarTransporterOnRoute1 = true;
				return;
			}
		}
		if (!this.isCarTransporterOnRoute2) {
			if (this.shipmentQueToDealership2.length > this.minCapacityForShipment) {
				this.carsOnTransporterToDealership2Array.push(
					...this.shipmentQueToDealership2.splice(
						0,
						this.minCapacityForShipment + 1
					)
				);
				this.isCarTransporterOnRoute2 = true;
				return;
			}
			if (
				this.shipmentQueToDealership2.length >
				this.minCapacityForShipment - 1
			) {
				this.carsOnTransporterToDealership2Array.push(
					...this.shipmentQueToDealership2.splice(
						0,
						this.minCapacityForShipment
					)
				);
				this.isCarTransporterOnRoute2 = true;
				return;
			}
		}
	}
	// Разгрузить первый автовоз
	unloadCargo1() {
		this.carsOnTransporterToDealership1Array = [];
		this.isCarTransporterOnRoute1 = false;
		this.daysOfShipment1 = 0;
	}
	// Разгрузить второй автовоз
	unloadCargo2() {
		this.carsOnTransporterToDealership2Array = [];
		this.isCarTransporterOnRoute2 = false;
		this.daysOfShipment2 = 0;
	}
	// Прошел еще один день
	anotherDayPasses() {
		if (this.isCarTransporterOnRoute1) {
			this.daysOfShipment1++;
		}
		if (this.isCarTransporterOnRoute2) {
			this.daysOfShipment2++;
		}
	}
	// Проверить, доехал ли до салона первый автопогрузчик
	checkIfShipmentArrives1() {
		if (this.deliveryTime === this.daysOfShipment1) {
			return true;
		}
		return false;
	}
	// Проверить, доехал ли до салона второй автопогрузчик
	checkIfShipmentArrives2() {
		if (this.deliveryTime === this.daysOfShipment2) {
			return true;
		}
		return false;
	}
}
// Класс "склад в Ханко"
export class HankoStorage {
	// Погручик на маршруте
	public isCarTransporterOnRoute = false;
	// Время погрузчика в пути
	public daysOfShipment = 0;
	// Время за которое происходит доставка
	public deliveryTime: number;
	// Минимальный обьем заявок на поставку для отправки автовоза
	public minCapacityForShipment: number;
	// Машины в погрузчике
	public shipmentQue: carsToShipmentFromHankoI[] = [];
	// Очередь на поставку
	public mainQue: carsToShipmentFromHankoI[] = [];
	constructor(deliveryTime: number, minCapacityForShipment: number) {
		this.deliveryTime = deliveryTime;
		this.minCapacityForShipment = minCapacityForShipment;
	}
	// Добавить машину в общую очередь
	addCarToMainQue(car: carsToShipmentFromHankoI) {
		this.mainQue.push(car);
	}
	// Прошел еще один день
	anotherDayPasses() {
		if (this.isCarTransporterOnRoute) {
			this.daysOfShipment++;
		}
	}
	// Проверить, пришел ли погрузчик на склад
	checkIfShipmentArrives() {
		if (this.deliveryTime === this.daysOfShipment) {
			return true;
		}
		return false;
	}
	// Разгрузить погрузчик
	unloadCargo() {
		this.shipmentQue = [];
		this.isCarTransporterOnRoute = false;
		this.daysOfShipment = 0;
	}
	// Достаточно ли заявок для отправки погрузчика
	isSendCarTransporter() {
		if (!this.isCarTransporterOnRoute) {
			if (this.mainQue.length > this.minCapacityForShipment) {
				this.shipmentQue.push(
					...this.mainQue.splice(0, this.minCapacityForShipment + 1)
				);
				this.isCarTransporterOnRoute = true;
				return;
			}
			if (this.mainQue.length > this.minCapacityForShipment - 1) {
				this.shipmentQue.push(
					...this.mainQue.splice(0, this.minCapacityForShipment)
				);
				this.isCarTransporterOnRoute = true;
				return;
			}
		}
	}
}
