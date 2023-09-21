export enum pricesOfCars {
	Impreza = 2000000,
	Solterra = 4000000,
	Outback = 3500000,
	Forester = 3000000,
}
export enum lastDaysOfShipment {
	Dealership = 10,
	MoscowStorage = 30,
	Factory = 90,
}

export const getRandomNumberBetween = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max + 1 - min) + min);
};

export const potentialClientGenerator = (min: number, max: number): number => {
	return getRandomNumberBetween(min, max);
};

export const managerFilter = (potentialClients: number): number => {
	let numberOfClients = 0;
	for (let index = 0; index < potentialClients; index++) {
		if (getRandomNumberBetween(1, 10) === 10) {
			numberOfClients++;
		}
	}
	return numberOfClients;
};

interface clientOrderI {
	orderId: number;
	priceOfCar: number;
	storageId: number;
	prepayment: number;
	postpayment: number;
	lastDayForShipment: number;
	fineForDelay: number;
}

export class ClientOrder {
	public daysOfShipment: number = 0;
	public fineForDelay: number = 0;
	public postpayment: number = 0;
	constructor(
		public orderId: number,
		public priceOfCar: number,
		public storageId: number,
		public prepayment: number,
		public lastDayForShipment: number
	) {
		this.postpayment = priceOfCar - prepayment;
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
	public numberOfCars: number;
	public numberOfDaysInStorage: numberOfDaysInStorageI[];
	public clientOrdersArray: ClientOrder[];
	public carsToShipmentArray: carsToShipmentI[] = [];
	public orderToHankoStrategy: number;
	public orderToHanko: number[] = [];
	constructor(private maxStorageSize: number, orderToHankoStrategy: number) {
		this.orderToHankoStrategy = orderToHankoStrategy;
		this.numberOfCars = maxStorageSize;
		this.numberOfDaysInStorage = Array(maxStorageSize).fill({
			payedMonth: 0,
			daysBeforeShipment: 0,
		});
		this.clientOrdersArray = [];
	}
	public placeAnOrderToHanko() {}
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
	}
	private addCar() {
		if (this.numberOfCars < this.maxStorageSize) {
			this.numberOfCars++;
			this.numberOfDaysInStorage.push({ payedMonth: 0, daysBeforeShipment: 0 });
		} else {
			throw new Error('Склад полон');
		}
	}
	private removeCar() {
		if (this.numberOfCars > 0) {
			this.numberOfCars--;
			this.numberOfDaysInStorage.pop;
		} else {
			throw new Error('Склад пуст');
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
	public carsToShipmentToDealership1Array: carsToShipmentI[] = [];
	public carsToShipmentToDealership2Array: carsToShipmentI[] = [];
	public shipmentQueToDealership1: carsToShipmentI[] = [];
	public shipmentQueToDealership2: carsToShipmentI[] = [];
	constructor(deliveryTime: number, minCapacityForShipment: number) {
		this.deliveryTime = deliveryTime;
		this.minCapacityForShipment = minCapacityForShipment;
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
				this.carsToShipmentToDealership1Array.push(
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
				this.carsToShipmentToDealership1Array.push(
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
				this.carsToShipmentToDealership2Array.push(
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
				this.carsToShipmentToDealership2Array.push(
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
		this.shipmentQueToDealership1 = [];
		this.isCarTransporterOnRoute1 = false;
		this.daysOfShipment1 = 0;
	}
	unloadCargo2() {
		this.shipmentQueToDealership2 = [];
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
