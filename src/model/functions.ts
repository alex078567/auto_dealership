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

// interface clientOrderI {
// 	orderId: number;
// 	priceOfCar: number;
// 	storageId: number;
// 	prepayment: number;
// 	postpayment: number;
// 	lastDayForShipment: number;
// 	fineForDelay: number;
// }

export class ClientOrder {
	// время поки идет доставка
	public daysOfShipment: number = 0;
	// штраф за задержку
	//public fineForDelay: number = 0;
	// постоплата
	public postpayment: number = 0;
	constructor(
		// id заказа
		public orderId: number,
		// цена машины
		public priceOfCar: number,
		// склад с которого поставка
		public storageId: number,
		// предоплата
		public prepayment: number,
		// крайний срок доставки
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

interface carsToShipmentI {
	orderId: number;
}

interface carsToShipmentFromHankoI extends carsToShipmentI {
	isForDealership1?: boolean;
}
interface numberOfDaysInStorageI {
	payedMonth: number;
	daysBeforeShipment: number;
}
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
	public daysInMonth = 30;

	private totalNumberOfDaysInDelivery = 0;
	private totalNumbersOfDeliveredCars = 0;
	public averageDeliveryTime = 0;

	public storageMonthlyPaymentTotal = 0;
	public storageMonthlyPayment = 6000;
	// едет ли погрузчик в другой салон?
	public isCarTransporterOnRoute = false;
	// Заказ в Ханко
	public orderToHanko: number[] = [];
	// Конструктор (размер склада, заказ в ханко)
	constructor(
		private maxStorageSize: number,
		orderToHankoStrategy: number,
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
	// Разместить заказ в ханко
	// public placeAnOrderToHanko(
	// 	isForDealership1: boolean,
	// 	hankoStorage: HankoStorage,
	// 	orderId: number
	// ) {
	// 	this.orderToHanko.forEach((order) => {
	// 		this.totalExpenses += order;
	// 		hankoStorage.addCarToMainQue({
	// 			isForDealership1: isForDealership1,
	// 			orderId: orderId,
	// 		});
	// 	});
	// }
	// доставка в ханко id = -10
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
	public checkIfShipmentArrives() {
		if (this.deliveryTime === this.daysOfShipment) {
			return true;
		}
		return false;
	}
	public unloadCargo() {
		this.carsToShipmentArray.shift();
		this.isCarTransporterOnRoute = false;
		this.daysOfShipment = 0;
	}

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
	public addToHankoQue(price: number) {
		this.orderToHanko.push(price);
	}
	public isSendCarTransporter() {
		if (!this.isCarTransporterOnRoute && this.carsToShipmentArray.length > 0) {
			this.totalExpenses += 15000;
			this.isCarTransporterOnRoute = true;
		}
	}
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
	public isCouldPlaceAnOrderToHanko() {
		if ((this.orderToHanko.length = this.orderToHankoStrategy)) {
		}
	}

	public addNewOrder(clientOrder: ClientOrder) {
		this.clientOrdersArray.push(clientOrder);
	}
	private fulfillOrder(clientId: number) {
		this.clientOrdersArray.filter((clientOrder) => {
			clientOrder.orderId != clientId;
		});
	}
}

export class MoscowStorage {
	public minCapacityForShipment: number;
	public deliveryTime: number;
	public isCarTransporterOnRoute1 = false;
	public daysOfShipment1 = 0;
	public isCarTransporterOnRoute2 = false;
	public daysOfShipment2 = 0;
	public carsOnTransporterToDealership1Array: carsToShipmentI[] = [];
	public carsOnTransporterToDealership2Array: carsToShipmentI[] = [];
	// Очередь на отправку (не поставку)
	public shipmentQueToDealership1: carsToShipmentI[] = [];
	public shipmentQueToDealership2: carsToShipmentI[] = [];
	constructor(deliveryTime: number, minCapacityForShipment: number) {
		this.deliveryTime = deliveryTime;
		this.minCapacityForShipment = minCapacityForShipment;
	}
	public addCarToShipmentQueToDealership1(car: carsToShipmentI) {
		this.shipmentQueToDealership1.push(car);
	}
	public addCarToShipmentQueToDealership2(car: carsToShipmentI) {
		this.shipmentQueToDealership2.push(car);
	}
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
	unloadCargo1() {
		this.carsOnTransporterToDealership1Array = [];
		this.isCarTransporterOnRoute1 = false;
		this.daysOfShipment1 = 0;
	}
	unloadCargo2() {
		this.carsOnTransporterToDealership2Array = [];
		this.isCarTransporterOnRoute2 = false;
		this.daysOfShipment2 = 0;
	}
	anotherDayPasses() {
		if (this.isCarTransporterOnRoute1) {
			this.daysOfShipment1++;
		}
		if (this.isCarTransporterOnRoute2) {
			this.daysOfShipment2++;
		}
	}
	checkIfShipmentArrives1() {
		if (this.deliveryTime === this.daysOfShipment1) {
			return true;
		}
		return false;
	}
	checkIfShipmentArrives2() {
		if (this.deliveryTime === this.daysOfShipment2) {
			return true;
		}
		return false;
	}
}

export class HankoStorage {
	public isCarTransporterOnRoute = false;
	public daysOfShipment = 0;
	public deliveryTime: number;
	public minCapacityForShipment: number;
	public shipmentQue: carsToShipmentFromHankoI[] = [];
	public mainQue: carsToShipmentFromHankoI[] = [];
	constructor(deliveryTime: number, minCapacityForShipment: number) {
		this.deliveryTime = deliveryTime;
		this.minCapacityForShipment = minCapacityForShipment;
	}

	addCarToMainQue(car: carsToShipmentFromHankoI) {
		this.mainQue.push(car);
	}
	anotherDayPasses() {
		if (this.isCarTransporterOnRoute) {
			this.daysOfShipment++;
		}
	}
	checkIfShipmentArrives() {
		if (this.deliveryTime === this.daysOfShipment) {
			return true;
		}
		return false;
	}
	unloadCargo() {
		this.shipmentQue = [];
		this.isCarTransporterOnRoute = false;
		this.daysOfShipment = 0;
	}
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
