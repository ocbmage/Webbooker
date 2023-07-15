import {
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
    OnChanges,
    Input,
    SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { VehicleTypeResponse } from 'src/app/API.service';
import {
    APIService,
    InsertTripResponse,
    VehicleType,
} from 'src/app/API.service';
import { ModalService } from 'src/app/shared/Modal/Modal.service';
import { SharedService } from 'src/app/shared/shared.service';
import { BookingService } from '../shared/booking-service';
import { SelectAddressService } from '../shared/select-address.service';
import { TripDetailsService } from '../shared/trip-details.service';
import { DateTimeSelectComponent } from './date-time-select/date-time-select.component';
import { FormErrorsDialogComponent } from './form-errors-dialog/form-errors-dialog.component';
import { PhoneNumberInputComponent } from './phone-number-input/phone-number-input.component';
import { TripCodeConfirmationModalComponent } from './trip-code-confirmation/trip-code-confirmation-modal.component';
import { VehicleTypeSelectComponent } from './vehicle-type-select/vehicle-type-select.component';
import { RideConfirmationModalComponent } from './ride-confirmation/ride-confirmation-modal.component';
import { GetTripCodeConfirmationModalComponent } from './gettripcode-confirmation/gettripcode-confirmation-modal.component';
import { RideRequestPolygonConfirmationModalComponent } from './ride-request-polygon-confirmation/ride-request-polygon-confirmation-modal.component';
import { RideRequestPolygonTripCodeConfirmationModalComponent } from './ride-request-polygon-trip-code-confirmation/ride-request-polygon-trip-code-confirmation-modal.component';
import { BookRideConfirmationModalComponent } from './bookride-confirmation/bookride-confirmation-modal.component';
import { InfoTripCodeModalComponent } from './infotripcode-confirmation/infotripcodeconfirmation-modal.component';
import { isLive } from 'config';

@Component({
    selector: 'app-ride-details',
    templateUrl: './ride-details.component.html',
    styleUrls: ['./ride-details.component.css'],
})
export class RideDetailsComponent implements OnInit, OnDestroy, OnChanges {

    VEHICLE_TYPES: any = {
        '1': {
            displayName: 'Standard Taxi',
            numberOfSeats: '4 seats',
            desc: 'Fastest ride to get you there.',
        },
        '2': {
            displayName: 'Roomy Taxi',
            numberOfSeats: '4 seats',
            desc: 'A wagon or minivan for extra stuff.',
        },
        '3': {
            displayName: 'Minivan Taxi',
            numberOfSeats: '6 seats',
            desc: 'A bigger vehicle for your group.',
        },
        '4': {
            displayName: 'Accessible Van',
            numberOfSeats: '4 seats + 1 wheelchair',
            desc: 'Limited supply. 24 hr advanced booking recommended.',
        },
    };
    addressSuggestionsActive = false;
    // ! set to false
    showCabAndFare = false;
    // ! set to false
    showPassengerDetails = false;
    insertTripInProgress = false;

    addressSuggestionsActiveSetSubscription: Subscription = null;
    fareCalculatedSubscription: Subscription = null;
    selectPickupAddressSubscription: Subscription = null;
    selectDropOffAddressSubscription: Subscription = null;
    clearPickupAddressSubscription: Subscription = null;
    clearDropOffAddressSubscription: Subscription = null;
    requestRideBtnEnableSubscription: Subscription = null;
    subscriptions: Subscription[] = [
        this.addressSuggestionsActiveSetSubscription,
        this.fareCalculatedSubscription,
        this.selectPickupAddressSubscription,
        this.selectDropOffAddressSubscription,
        this.clearPickupAddressSubscription,
        this.clearDropOffAddressSubscription,
    ];
    pickupDate: Date = null;
    pickupTime: any = {
        hours: 0,
        minutes: 0,
        period: 'AM',
    };

    selectedDateTimeShow: String = ''

    currentDate: Date;
    isNow: boolean;
    vehicleTypes: VehicleType[] = [];
    selectedVehicleType: any = null;
    isWillCall = false;
    timeZoneAbbrev: string = '';

    fare: any = null;
    tripNbr: number = null;
    tripCode: string = null;
    displayFare: any = null;
    questions: string[] = [];
    questionsAnswer: string[] = [];

    @Input('username') username: string;
    form: FormGroup;
    disableDrag = true;
    submitted = false;

    invalidEmail: boolean = false;
    requiredEmail: boolean = false;

    requiredName: boolean = false;
    isTwoLetterError: boolean = false;

    focusPassenger: boolean = false;
    focusPhone: boolean = false;
    focusEmail: boolean = false;


    isPickupAirport: boolean = false;
    pickupAirportName: string = '';


    @ViewChild('rideDetailsContainer') rideDetailsContainer: ElementRef;
    @ViewChild('rideDetailsSmallContainer') rideDetailsSmallContainer: ElementRef;
    @ViewChild('pickupNow') pickupNow: ElementRef;
    @ViewChild(PhoneNumberInputComponent)
    phoneNumberInputComponent: PhoneNumberInputComponent;

    allowScroll = true;
    scrollPosition = 0;
    originalPosition = 0;

    isSwipedUp = false;  // initial state is bottom

    isMobile = false;
    savedPhoneNumber = '';

    rightBoxDisplay: boolean = false; //Rightbox display state
    nextBtnDisplaty: boolean = true; //Next Button state(disable/enable)
    noteDriver: String = '';//Note For driver
    constructor(
        private bookingService: BookingService,
        private selectAddressService: SelectAddressService,
        private tripDetailsService: TripDetailsService,
        private fb: FormBuilder,
        private api: APIService,
        private dialog: MatDialog,
        private sharedService: SharedService,
        private modalService: ModalService
    ) {

        if (window.innerWidth <= 800)
            this.isMobile = true

        this.addressSuggestionsActiveSetSubscription =
            this.selectAddressService.addressSuggestionsActiveSet.subscribe(
                () => {
                    console.log("addressSugesstionsActive!!!!!!!!")
                    console.log(this.addressSuggestionsActive);
                    if (!this.isSwipedUp)
                        this.onClickDragBar();

                    // if (
                    //     !this.addressSuggestionsActive &&
                    //     this.selectAddressService.addressSuggestionsActive &&
                    //     !this.disableDrag &&
                    //     window.innerHeight <= 400
                    // ) {
                    //     console.log(
                    // `translateY(-${
                    //     this.rideDetailsContainer.nativeElement.getBoundingClientRect()
                    //         .top
                    // }px)`
                    //     );
                    // this.rideDetailsContainer.nativeElement.style.transform = `translateY(-${
                    //     this.rideDetailsContainer.nativeElement.getBoundingClientRect()
                    //         .top
                    // }px)`;
                    // }
                    this.addressSuggestionsActive =
                        this.selectAddressService.addressSuggestionsActive;
                }
            );

        this.requestRideBtnEnableSubscription =
            this.selectAddressService.requestRideBtnEnable.subscribe((value) => {
                if (value.isAirport) {
                    // show modal
                    const dialogRef = this.dialog.open(RideRequestPolygonConfirmationModalComponent, {
                        data: {
                            pickupName: value.poly_name//this.selectAddressService.pickupAddress.title
                        },
                        // maxWidth: "500px",
                        width: "380px"
                    });

                    dialogRef.afterClosed().subscribe(dialogResult => {
                        if (dialogResult) {

                        }
                    });

                }
                this.isPickupAirport = value.isAirport;
                this.pickupAirportName = value.isAirport ? value.poly_name : '';
            })
        this.selectPickupAddressSubscription =
            this.selectAddressService.pickupAddressSelected.subscribe(() => {
                console.log("ride-details pickupaddress subscript")
                if (
                    this.selectAddressService.pickupAddress &&
                    this.selectAddressService.dropOffAddress &&
                    this.selectAddressService.pickupInServiceArea
                ) {
                    this.addressSuggestionsActive = false; // this means it is ready to calculate route
                    if (this.isSwipedUp)
                        this.onClickDragBar();            // so set this value to false  /* ABS */

                    this.showCabAndFare = true;
                    this.showPassengerDetails = true;
                    this.getAvailableVehicleTypes();
                    this.tripDetailsService.getFare();

                    // check polygon area
                    // console.log("selectPickupAddressSubscription")
                    this.selectAddressService.checkPolygonAirport(this.selectAddressService.pickupAddress)

                } else if (
                    this.selectAddressService.pickupAddress &&
                    this.selectAddressService.pickupInServiceArea
                ) {
                    this.getAvailableVehicleTypes();
                }
            });
        this.selectDropOffAddressSubscription =
            this.selectAddressService.dropOffAddressSelected.subscribe(() => {
                if (
                    this.selectAddressService.pickupAddress &&
                    this.selectAddressService.dropOffAddress &&
                    this.selectAddressService.pickupInServiceArea
                ) {
                    // check polygon area
                    console.log("selectDropoffAddressSubscription")
                    this.selectAddressService.checkPolygonAirport(this.selectAddressService.pickupAddress)

                    this.addressSuggestionsActive = false; // this means it is ready to calculate route
                    if (this.isSwipedUp)
                        this.onClickDragBar();            // so set this value to false  /* ABS */

                    this.showCabAndFare = true;
                    this.showPassengerDetails = true;
                    if (this.vehicleTypes.length < 1) {
                        this.getAvailableVehicleTypes();
                    } else if (this.selectedVehicleType) {
                        this.tripDetailsService.setEta(
                            this.selectedVehicleType.eta
                        );
                    }

                    this.tripDetailsService.getFare();
                }
            });

        this.clearPickupAddressSubscription =
            this.selectAddressService.pickupAddressCleared.subscribe(() => {
                this.clearFare();
            });

        this.clearDropOffAddressSubscription =
            this.selectAddressService.dropOffAddressCleared.subscribe(() => {
                this.clearFare();
            });
        this.fareCalculatedSubscription =
            this.tripDetailsService.fareCalculated.subscribe((fare) => {
                this.displayFare = fare;
                this.tripDetailsService.setTripTime(fare.minutes);
            });
        this.bookingService.bookingDataRefresh.subscribe(() => {
            // refresh fare price
            console.log('refresh booking data @ ride details');
            if (this.displayFare != null) {
                this.displayFare = null;
                this.tripDetailsService.getFare();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.username) {
            this.form.patchValue({
                email: this.username
            });
        }
    }

    getInnerHeight() {
        return window.innerHeight;
    }
    displayRightBox() {

        this.rightBoxDisplay = true;
        this.getQuestion(false);
    }

    public nextBtnState() {
        if (!this.isTwoLetterError && this.noteDriver != '' && this.savedPhoneNumber != '' && this.savedPhoneNumber.length > 2) {
            console.log('HereHereHereHereHereHereHereHereHereHere', this.isTwoLetterError)
            this.nextBtnDisplaty = false;
        } else {
            this.nextBtnDisplaty = true;
        }
    }

    @HostListener('window:resize', ['$event']) onResize(): void {
        if (window.innerWidth <= 800) {
            this.isMobile = true
            this.disableDrag = false;
        } else {
            this.isMobile = false
            this.disableDrag = true;
            this.allowScroll = true;
            // this.rideDetailsContainer.nativeElement.style.transform = 'none';
        }

        // if (
        //     this.addressSuggestionsActive &&
        //     !this.disableDrag &&
        //     window.innerHeight <= 400 &&
        //     this.rideDetailsContainer.nativeElement.getBoundingClientRect()
        //         .top > 0
        // ) {
        //     // alert(
        //     //     `translateY(-${
        //     //         this.rideDetailsContainer.nativeElement.getBoundingClientRect()
        //     //             .top
        //     //     }px)`
        //     // );
        //     this.rideDetailsContainer.nativeElement.style.transform = `translateY(-${
        //         this.rideDetailsContainer.nativeElement.getBoundingClientRect()
        //             .top
        //     }px)`;
        //     // alert(
        //     //     `translateY(-${
        //     //         this.rideDetailsContainer.nativeElement.getBoundingClientRect()
        //     //             .top
        //     //     }px)`
        //     // );
        // } else {
        //     this.rideDetailsContainer.nativeElement.style.transform = `revert`;
        // }
        // } else {
        //     this.rideDetailsContainer.nativeElement.style.transform = 'none';
        // }
    }

    public ngAfterViewInit() {
        this.originalPosition =
            this.rideDetailsContainer.nativeElement.getBoundingClientRect().top;
    }

    public ngOnInit(): void {
        if (window.innerWidth <= 800) {
            this.disableDrag = false;
        }
        //add by ASE
        this.isNow = this.tripDetailsService.isNow;
        this.initPickupDateTime()


        this.addressSuggestionsActive =
            this.selectAddressService.addressSuggestionsActive;

        this.form = this.fb.group({
            name: [null, Validators.required],
            // phone: [null, Validators.required],
            email: [
                this.username,
                Validators.compose([Validators.required, Validators.email]),
            ],
            comment: null,
        });
    }

    public initPickupDateTime(): void {
        const date = new Date();
        date.setMinutes(date.getMinutes());
        this.pickupTime = {
            hours: date.getHours(),
            minutes: Math.ceil(date.getMinutes() / 5) * 5,
            period: date.getHours() >= 12 ? 'PM' : 'AM',
        };

        if (this.pickupTime.minutes === 60) {
            this.pickupTime.minutes = 0;
        }

        if (this.pickupTime.hours > 12) {
            this.pickupTime.hours = this.pickupTime.hours - 12;
        }
        this.currentDate = date;
        this.pickupDate = date;


        this.tripDetailsService.pickupDate = this.pickupDate;
        this.tripDetailsService.pickupTime = this.pickupTime;

        this.timeZoneAbbrev = this.sharedService.getTimeZoneAbbrev(
            this.tripDetailsService.zoneId
        );
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    private getAvailableVehicleTypes(): void {
        console.log('calling getAvailableVehicleTypes');

        const pickup = {
            lat: this.selectAddressService.pickupAddress.lat,
            lng: this.selectAddressService.pickupAddress.lng,
        };

        const geometry = this.selectAddressService.pickupGeometry;
        const fleetId = geometry.fleet;
        const zoneId = this.tripDetailsService.zoneId;
        this.api
            .GetTypes('t', pickup.lat, pickup.lng, zoneId, fleetId)
            .then((response: VehicleTypeResponse) => {
                if (response.error) {
                    // ? What to do in the case of this error
                    console.log(response);
                } else {
                    this.vehicleTypes = response.data.types;
                    this.vehicleTypes.forEach((v: any) => {
                        v.type = v.type.toString();
                    });
                    this.selectedVehicleType = this.vehicleTypes[0];
                    this.tripDetailsService.setEta(
                        this.selectedVehicleType.eta
                    );
                }
            })
            .catch((error) => {
                // ? What to do in the case of this error?
                console.log(error);
            });
    }

    public openVehicleSelectDialog(): void {
        if (this.displayFare == null || this.displayFare.error != null) {
            return;
        }
        let dialogConfig: any = this.sharedService.getModalSize();
        dialogConfig.maxWidth = '560px';
        dialogConfig.data = {
            selectedVehicleType: this.selectedVehicleType,
            vehicleTypes: this.vehicleTypes,
            displayFare: this.displayFare,
            isNow: this.isNow
        };

        let countExist = 0;
        for (let i = 0; i < this.vehicleTypes.length; i++) {
            if (this.vehicleTypes[i].exist == 1)
                countExist++;
        }

        if (countExist <= 1) {
            return;
        }
        const dialogRef = this.dialog.open(
            VehicleTypeSelectComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((type: any) => {
            if (type) {
                this.selectedVehicleType = type;
                this.tripDetailsService.setEta(type.eta);
                // ! uncomment below if different vehicle types have different fare prices
                // this.fare = null;
                // this.tripDetailsService.getFare();
                // !
            }
        });
    }

    private insertTrip(flag: Boolean): void {
        const pickupAddress = this.selectAddressService.pickupAddress;
        const dropOffAddress = this.selectAddressService.dropOffAddress;
        const pickupPosition = {
            lat: pickupAddress.lat,
            lng: pickupAddress.lng,
        };
        const dropOffPosition = {
            lat: dropOffAddress.lat,
            lng: dropOffAddress.lng,
        };
        console.log(pickupAddress);
        console.log(dropOffAddress);
        console.log(this.displayFare, "======================");
        const passengerDetails = this.form.getRawValue();
        for (let key in passengerDetails) {
            if (passengerDetails[key] != null) {
                passengerDetails[key] = passengerDetails[key].trim();
            }
        }
        passengerDetails.firstName = '';
        passengerDetails.lastName = '';
        const splitPassengerName = passengerDetails.name.split(' ');
        passengerDetails.firstName = splitPassengerName[0];
        if (splitPassengerName.length > 1) {
            splitPassengerName.shift();
            passengerDetails.lastName = splitPassengerName.join(' ');
        }
        if (passengerDetails.lastName === '') {
            passengerDetails.lastName = ' ';
        }
        passengerDetails.phone =
            this.phoneNumberInputComponent.getFormattedPhoneNumber();
        const zoneId = this.tripDetailsService.zoneId;
        let date;
        if (this.isNow) {
            date = this.sharedService.getCurrentTimeInUTC(zoneId);
        } else {
            date = this.sharedService.convertTimeToUTC(
                zoneId,
                this.pickupDate,
                this.pickupTime
            );
        }


        const strAccountNbr = this.sharedService.custId;
        const PricingEngineData = JSON.stringify(this.displayFare);
        // required parameters : an error will be returned if any of these are missing
        // 'pkupDate',
        // 'pkupLat',
        // 'pkupLng',
        // 'destLat',
        // 'destLng',
        // 'nbrPass',
        // 'tripRate',
        // 'distance',
        // 'timeEstimate',
        // 'source',
        // 'vehicleType',
        let parameters: any = {
            userId: this.sharedService.userId, // need to randomly generate these for unauth guests
            comment: passengerDetails.comment,
            pkupDate: date,
            pkupStreet:
                pickupAddress.address.houseNumber +
                ' ' +
                pickupAddress.address.street,
            pkupApt: '', // ! need to set this
            pkupCity: pickupAddress.address.city,
            pkupState: pickupAddress.address.stateCode,
            pkupZip: pickupAddress.address.postalCode.split('-')[0],
            pkupLat: pickupPosition.lat,
            pkupLng: pickupPosition.lng,
            destStreet:
                dropOffAddress.address.houseNumber +
                ' ' +
                dropOffAddress.address.street,
            destApt: '', // ! need to set this
            destCity: dropOffAddress.address.city,
            destState: dropOffAddress.address.stateCode,
            destZip: dropOffAddress.address.postalCode.split('-')[0],
            destLat: dropOffPosition.lat,
            destLng: dropOffPosition.lng,
            nbrPass: 1, // not being used currently, but still required
            tripRate: this.displayFare.fare, // ! need to make sure this is right for discounted trips
            distance: this.displayFare.miles,
            timeEstimate: this.displayFare.minutes,
            isNow: this.isNow, // ! changes depending on trip type
            couponId: String(this.displayFare.promoId != null ? this.displayFare.promoId : ''),
            source: '9994', // ! need to figure out which code to use for this. Talk to Shan && Chad
            vehicleType: this.selectedVehicleType.type,
            pickupTime: '', // this does not appear to still be used
            paymentId: '',
            paymentMethod: '', // ! what are the other possible values for this?
            tip: 0,
            tipType: '',
            isWillCall: this.isWillCall, // ! changes depending on if it is a walkup trip or not
            phone: passengerDetails.phone,
            firstName: passengerDetails.firstName,
            lastName: passengerDetails.lastName,
            passEmail: passengerDetails.email,
            PkupName: pickupAddress.title,
            DestName: dropOffAddress.title,
            isLive,
            processingFee: this.displayFare.processingFee,
            strAccountNbr: strAccountNbr,
            ClientInfo1: '',
            ClientInfo2: '',
            ClientInfo3: '',
            ClientInfo4: '',
            ClientInfo5: '',
            ClientInfo6: '',
            PricingEngineData: PricingEngineData,
            ApiStage: flag
        };

        if (flag)
            parameters = {
                ...parameters, ClientInfo1: this.questionsAnswer[0],
                ClientInfo2: this.questionsAnswer[1],
                ClientInfo3: this.questionsAnswer[2],
                ClientInfo4: this.questionsAnswer[3],
                ClientInfo5: this.questionsAnswer[4],
                ClientInfo6: this.questionsAnswer[5],
            }

        //if(this.questionsAnswer[1] === null | this.questionsAnswer[1])

        this.insertTripInProgress = true;

        console.log("insertTripCode_____________: ", {
            userId: parameters.userId,
            comment: parameters.comment,
            pkupDate: parameters.pkupDate,
            pkupStreet: parameters.pkupStreet,
            pkupApt: parameters.pkupApt,
            pkupCity: parameters.pkupCity,
            pkupState: parameters.pkupState,
            pkupZip: parameters.pkupZip,
            pkupLat: parameters.pkupLat,
            pkupLng: parameters.pkupLng,
            destStreet: parameters.destStreet,
            destApt: parameters.destApt,
            destCity: parameters.destCity,
            destState: parameters.destState,
            destZip: parameters.destZip,
            destLat: parameters.destLat,
            destLng: parameters.destLng,
            nbrPass: parameters.nbrPass,
            tripRate: parameters.tripRate,
            distance: parameters.distance,
            timeEstimate: parameters.timeEstimate,
            isNow: parameters.isNow,
            couponId: parameters.couponId,
            source: parameters.source,
            vehicleType: parameters.vehicleType,
            pickupTime: parameters.pickupTime,
            paymentId: parameters.paymentId,
            paymentMethod: parameters.paymentMethod,
            tip: parameters.tip,
            tipType: parameters.tipType,
            isWillCall: parameters.isWillCall,
            phone: parameters.phone,
            firstName: parameters.firstName,
            lastName: parameters.lastName,
            passEmail: parameters.passEmail,
            placeName: parameters.placeName,
            PkupName: parameters.PkupName,
            DestName: parameters.DestName,
            isLive: parameters.isLive,
            processingFee: parameters.processingFee,
            strAccountNbr: parameters.strAccountNbr,
            PricingEngineData: parameters.PricingEngineData,
            ApiStage: flag
        })

        debugger
        this.api
            .InsertTrip(
                parameters.userId,
                parameters.comment,
                parameters.pkupDate,
                parameters.pkupStreet,
                parameters.pkupApt,
                parameters.pkupCity,
                parameters.pkupState,
                parameters.pkupZip,
                parameters.pkupLat,
                parameters.pkupLng,
                parameters.destStreet,
                parameters.destApt,
                parameters.destCity,
                parameters.destState,
                parameters.destZip,
                parameters.destLat,
                parameters.destLng,
                parameters.nbrPass,
                parameters.tripRate,
                parameters.distance,
                parameters.timeEstimate,
                parameters.isNow,
                parameters.couponId,
                parameters.source,
                parameters.vehicleType,
                parameters.pickupTime,
                parameters.paymentId,
                parameters.paymentMethod,
                parameters.tip,
                parameters.tipType,
                parameters.isWillCall,
                parameters.phone,
                parameters.firstName,
                parameters.lastName,
                parameters.passEmail,
                parameters.PkupName,
                parameters.DestName,
                parameters.isLive,
                parameters.processingFee,
                parameters.ClientInfo1,
                parameters.ClientInfo2,
                parameters.ClientInfo3,
                parameters.ClientInfo4,
                parameters.ClientInfo5,
                parameters.ClientInfo6,
                parameters.strAccountNbr,
                parameters.PricingEngineData,
                parameters.ApiStage
            )
            .then((response: InsertTripResponse) => {
                console.log(response);
                const data = response.data;

                // this.insertTripInProgress = false;
                //     // removed erorr dialog at the moment.
                //     this.modalService.openModal(
                //         `Error!`,
                //         'Pickup street number is required.',
                //         false
                //     );

                if (response.error) {
                    this.insertTripInProgress = false;
                    const messages = response.messages[0];
                    // removed erorr dialog at the moment.
                    this.modalService.openModal(
                        `Error!`,
                        `${messages.userMessage}`,
                        false
                    );
                } else {
                    this.insertTripInProgress = false;
                    this.tripNbr = data.tripNbr;
                    if (this.isWillCall) {
                        // Trip Code Confirmation
                        // the trip code for walk-up trips is the last 6 digits of the tripNbr
                        const tripNbrString = this.tripNbr.toString();
                        this.tripCode = tripNbrString.substring(
                            tripNbrString.length - 6
                        );

                        // show gettrip code confirmation popup
                        const dialogRef = this.dialog.open(GetTripCodeConfirmationModalComponent, {
                            data: {
                                tripCode: this.tripCode
                            }
                        });

                        dialogRef.afterClosed().subscribe(dialogResult => {
                            if (dialogResult) {

                            }
                        });

                        // this.modalService.openModal(
                        //     `Your trip code is ${this.tripCode}`,
                        //     null,
                        //     false
                        // );
                        // to make the trip clear
                        // this.resetForm();
                    } else {
                        console.log(response)
                        const tripNbr = response.data.tripNbr;
                        const servicingCompany = response.data.servicingCompany;
                        const companyPhone = response.data.companyPhone;
                        const message = response.messages[0].userMessage;
                        const zoneId = response.data.zoneId;
                        const pickup = response.data.pickup;
                        const destination = response.data.destination;
                        const passengerName = response.data.passengerName;
                        const passengerPhone = response.data.passengerPhone;
                        const callDate = response.data.callDate;

                        const dialogRef = this.dialog.open(BookRideConfirmationModalComponent, {
                            data: {
                                tripNbr: tripNbr,
                                servicingCompany: servicingCompany,
                                companyPhone: companyPhone,
                                message: message,
                                zoneId: zoneId,
                                pickup: pickup,
                                destination: destination,
                                passengerName: passengerName,
                                passengerPhone: passengerPhone,
                                callDate: callDate
                            }
                        });

                        dialogRef.afterClosed().subscribe(dialogResult => {
                            // if(dialogResult) {
                            this.resetForm();
                            // }
                        });
                        // this.modalService.openModal(
                        //     `Trip booked. Trip #: ${this.tripNbr}`,
                        //     null,
                        //     false
                        // );
                        // to make the trip clear
                        // this.resetForm();
                    }
                }
            })
            .catch((err: any) => {
                this.insertTripInProgress = false;
                console.log("farePrice Error==", err);
                this.modalService.openModal(
                    'Something went wrong. Please try again. ' +
                    JSON.stringify(err),
                    null,
                    false
                );
            });

    }

    private getQuestion(flag: Boolean): void {
        const pickupAddress = this.selectAddressService.pickupAddress;
        const dropOffAddress = this.selectAddressService.dropOffAddress;
        const pickupPosition = {
            lat: pickupAddress.lat,
            lng: pickupAddress.lng,
        };
        const dropOffPosition = {
            lat: dropOffAddress.lat,
            lng: dropOffAddress.lng,
        };
        console.log(pickupAddress);
        console.log(dropOffAddress);
        console.log(this.displayFare, "======================");
        const passengerDetails = this.form.getRawValue();
        for (let key in passengerDetails) {
            if (passengerDetails[key] != null) {
                passengerDetails[key] = passengerDetails[key].trim();
            }
        }
        passengerDetails.firstName = '';
        passengerDetails.lastName = '';
        const splitPassengerName = passengerDetails.name.split(' ');
        passengerDetails.firstName = splitPassengerName[0];
        if (splitPassengerName.length > 1) {
            splitPassengerName.shift();
            passengerDetails.lastName = splitPassengerName.join(' ');
        }
        if (passengerDetails.lastName === '') {
            passengerDetails.lastName = ' ';
        }
        passengerDetails.phone =
            this.phoneNumberInputComponent.getFormattedPhoneNumber();
        const zoneId = this.tripDetailsService.zoneId;
        let date;
        if (this.isNow) {
            date = this.sharedService.getCurrentTimeInUTC(zoneId);
        } else {
            date = this.sharedService.convertTimeToUTC(
                zoneId,
                this.pickupDate,
                this.pickupTime
            );
        }


        const strAccountNbr = this.sharedService.custId;
        const PricingEngineData = JSON.stringify(this.displayFare);
        // required parameters : an error will be returned if any of these are missing
        // 'pkupDate',
        // 'pkupLat',
        // 'pkupLng',
        // 'destLat',
        // 'destLng',
        // 'nbrPass',
        // 'tripRate',
        // 'distance',
        // 'timeEstimate',
        // 'source',
        // 'vehicleType',
        let parameters: any = {
            userId: this.sharedService.userId, // need to randomly generate these for unauth guests
            comment: passengerDetails.comment,
            pkupDate: date,
            pkupStreet:
                pickupAddress.address.houseNumber +
                ' ' +
                pickupAddress.address.street,
            pkupApt: '', // ! need to set this
            pkupCity: pickupAddress.address.city,
            pkupState: pickupAddress.address.stateCode,
            pkupZip: pickupAddress.address.postalCode.split('-')[0],
            pkupLat: pickupPosition.lat,
            pkupLng: pickupPosition.lng,
            destStreet:
                dropOffAddress.address.houseNumber +
                ' ' +
                dropOffAddress.address.street,
            destApt: '', // ! need to set this
            destCity: dropOffAddress.address.city,
            destState: dropOffAddress.address.stateCode,
            destZip: dropOffAddress.address.postalCode.split('-')[0],
            destLat: dropOffPosition.lat,
            destLng: dropOffPosition.lng,
            nbrPass: 1, // not being used currently, but still required
            tripRate: this.displayFare.fare, // ! need to make sure this is right for discounted trips
            distance: this.displayFare.miles,
            timeEstimate: this.displayFare.minutes,
            isNow: this.isNow, // ! changes depending on trip type
            couponId: String(this.displayFare.promoId != null ? this.displayFare.promoId : ''),
            source: '9994', // ! need to figure out which code to use for this. Talk to Shan && Chad
            vehicleType: this.selectedVehicleType.type,
            pickupTime: '', // this does not appear to still be used
            paymentId: '',
            paymentMethod: '', // ! what are the other possible values for this?
            tip: 0,
            tipType: '',
            isWillCall: this.isWillCall, // ! changes depending on if it is a walkup trip or not
            phone: passengerDetails.phone,
            firstName: passengerDetails.firstName,
            lastName: passengerDetails.lastName,
            passEmail: passengerDetails.email,
            PkupName: pickupAddress.title,
            DestName: dropOffAddress.title,
            isLive,
            processingFee: this.displayFare.processingFee,
            strAccountNbr: strAccountNbr,
            ClientInfo1: '',
            ClientInfo2: '',
            ClientInfo3: '',
            ClientInfo4: '',
            ClientInfo5: '',
            ClientInfo6: '',
            PricingEngineData: PricingEngineData,
            ApiStage: flag
        };

        //if(this.questionsAnswer[1] === null | this.questionsAnswer[1])

        this.insertTripInProgress = true;

        debugger
        this.api
            .InsertTrip(
                parameters.userId,
                parameters.comment,
                parameters.pkupDate,
                parameters.pkupStreet,
                parameters.pkupApt,
                parameters.pkupCity,
                parameters.pkupState,
                parameters.pkupZip,
                parameters.pkupLat,
                parameters.pkupLng,
                parameters.destStreet,
                parameters.destApt,
                parameters.destCity,
                parameters.destState,
                parameters.destZip,
                parameters.destLat,
                parameters.destLng,
                parameters.nbrPass,
                parameters.tripRate,
                parameters.distance,
                parameters.timeEstimate,
                parameters.isNow,
                parameters.couponId,
                parameters.source,
                parameters.vehicleType,
                parameters.pickupTime,
                parameters.paymentId,
                parameters.paymentMethod,
                parameters.tip,
                parameters.tipType,
                parameters.isWillCall,
                parameters.phone,
                parameters.firstName,
                parameters.lastName,
                parameters.passEmail,
                parameters.PkupName,
                parameters.DestName,
                parameters.isLive,
                parameters.processingFee,
                parameters.ClientInfo1,
                parameters.ClientInfo2,
                parameters.ClientInfo3,
                parameters.ClientInfo4,
                parameters.ClientInfo5,
                parameters.ClientInfo6,
                parameters.strAccountNbr,
                parameters.PricingEngineData,
                parameters.ApiStage
            )
            .then((response: InsertTripResponse) => {
                console.log(response);
                const data = response.data;

                // this.insertTripInProgress = false;
                //     // removed erorr dialog at the moment.
                //     this.modalService.openModal(
                //         `Error!`,
                //         'Pickup street number is required.',
                //         false
                //     );

                if (response.error) {
                    this.insertTripInProgress = false;
                    const messages = response.messages[0];
                    // removed erorr dialog at the moment.
                    this.modalService.openModal(
                        `Error!`,
                        `${messages.userMessage}`,
                        false
                    );
                } else {
                    this.insertTripInProgress = false;
                    this.tripNbr = data.tripNbr;

                    this.questions = response.data.questions;
                    console.log(this.questions)
                }
            })
            .catch((err: any) => {
                this.insertTripInProgress = false;
                console.log("farePrice Error==", err);
                this.modalService.openModal(
                    'Something went wrong. Please try again. ' +
                    JSON.stringify(err),
                    null,
                    false
                );
            });

    }

    public infoTripCodeClick(): void {
        this.dialog.open(InfoTripCodeModalComponent,
            {
                width: "380px"
            });
    }

    private validateRideDetails(): boolean {
        this.showRideDetailsError();
        return (
            this.form.valid &&
            this.phoneNumberInputComponent.getFormattedPhoneNumber() != null &&
            this.selectAddressService.pickupAddress != null &&
            this.selectAddressService.dropOffAddress != null &&
            this.selectAddressService.pickupInServiceArea
        );
    }

    public validateEmail(): void {
        this.form.controls['email'].markAsTouched(); // Mark the field as touched to trigger the validation
    }

    private showRideDetailsError(): void {
        console.log(this.phoneNumberInputComponent.getFormattedPhoneNumber());
        let errors = [];
        const phoneNumber =
            this.phoneNumberInputComponent.getFormattedPhoneNumber();
        if (this.selectAddressService.pickupAddress == null) {
            errors.push('Pickup location required.');
        }
        if (this.selectAddressService.dropOffAddress == null) {
            errors.push('Drop-off location required');
        }

        if (!this.selectAddressService.pickupInServiceArea) {
            errors.push('Pickup location is not in service area.');
        }


        this.phoneNumberInputComponent.invalidPhoneNumber = false;
        if (!this.form.valid || phoneNumber == null) {
            const controls = this.form.controls;
            // set submitted to true 

            this.submitted = true;

            // initialize 
            this.requiredEmail = false;
            this.invalidEmail = false;
            this.requiredName = false;

            this.phoneNumberInputComponent.requiredPhoneNumber = false;
            this.phoneNumberInputComponent.invalidPhoneNumber = false;


            Object.keys(controls).forEach(key => {
                controls[key].markAsTouched();
            });

            if (controls['name'].hasError('required')) {
                errors.push('Passenger Name is required.');
                this.requiredName = true;
            }

            // do phone number check here to keep the errors in the same orders as the
            // form controls

            if (this.phoneNumberInputComponent.phoneNumber == null || this.phoneNumberInputComponent.phoneNumber == '') {
                errors.push('Phone number is required.');
                this.phoneNumberInputComponent.requiredPhoneNumber = true;
                this.phoneNumberInputComponent.invalidPhoneNumber = false;
            } else if (phoneNumber == undefined) {
                errors.push('Phone number is invalid.');
                this.phoneNumberInputComponent.requiredPhoneNumber = false;
                this.phoneNumberInputComponent.invalidPhoneNumber = true;
            }

            if (controls['email'].hasError('required')) {
                errors.push('Email is required.');
                this.requiredEmail = this.form.controls['email'].invalid;
            } else if (controls['email'].hasError('email')) {
                errors.push('Email is invalid.');
                this.invalidEmail = this.form.controls['email'].invalid;
            }
        }
        if (errors.length > 0) {
            // const dialogConfig: any = this.sharedService.getModalSize();
            let dialogConfig = {
                data: {
                    errors,
                },
            };
            // dialogConfig.data = {
            //     errors,
            // };
            // this.dialog.open(FormErrorsDialogComponent, dialogConfig);
        }
    }

    public onFocusInput(event: any, field: string): void {

        this.onFocusOtherInputs(field);

        // alert(this.rideDetailsSmallContainer.nativeElement.scrollTop)


        if (field == "passenger")
            this.focusPassenger = true;
        else if (field == "email")
            this.focusEmail = true;

    }

    public onFocusInputOut(event: any, field: string): void {
        if (field == "passenger")
            this.focusPassenger = false;
        else if (field == "email") {
            this.focusEmail = false;
        }

    }


    public onChangePassengerName(event: any): void {
        console.log(event.target.value);
        if (this.requiredName) {
            if (event.target.value.length < 2) {
                this.isTwoLetterError = true;
            } else
                this.isTwoLetterError = false;
        }
        this.nextBtnState()
    }

    private resetForm(): void {
        this.form.reset();
        this.phoneNumberInputComponent.reset();
        this.bookingService.resetBooking();
        this.showCabAndFare = false;
        this.showPassengerDetails = false;
        this.selectedVehicleType = null;
    }

    public bookScheduledTrip(): void {
        // When click Request Ride button
        if (!this.validateRideDetails()) {
            return;
        }

        /**
         * TODO: Here should be request ride confirmation screen
         */

        this.isWillCall = false;
        this.insertTrip(true);

        // const dialogRef = this.dialog.open(RideConfirmationModalComponent, {
        //     maxWidth: "500px",
        //     width: "380px"
        // });

        // dialogRef.afterClosed().subscribe(dialogResult => {
        //     if(dialogResult) {
        //         this.isWillCall = false;
        //         this.insertTrip();
        //     }
        // });
    }

    public bookWalkUpTrip(): void {
        if (!this.validateRideDetails()) {
            return;
        }
        this.openTripCodeConfirmationModal()
            .then((res: boolean) => {
                console.log(res);
                if (res === true) {
                    this.isWillCall = true;
                    this.insertTrip(true);
                    this.rightBoxDisplay = false;
                }
            })
            .catch((err) => console.log(err));
    }

    public accountAnswerTrip(): void {
        if (!this.validateRideDetails()) {
            return;
        }
    }

    private openTripCodeConfirmationModal(): Promise<boolean> {
        if (this.isPickupAirport) {
            const dialogRef = this.dialog.open(RideRequestPolygonTripCodeConfirmationModalComponent, {
                data: {
                    pickupName: this.pickupAirportName ? this.pickupAirportName : '' //this.selectAddressService.pickupAddress.title
                },
                width: "380px"
            });
            return new Promise((resolve) => {
                dialogRef.afterClosed().subscribe((result: boolean) => {
                    resolve(result);
                });
            });

        } else {
            const dialogRef = this.dialog.open(TripCodeConfirmationModalComponent, {
                width: "380px"
            });
            return new Promise((resolve) => {
                dialogRef.afterClosed().subscribe((result: boolean) => {
                    resolve(result);
                });
            });
        }
    }

    formatDate(date: Date): string {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const suffix = this.getOrdinalSuffix(day);
        const dayStr = `${day}${suffix}`;
        const formatedDate = `${date.toLocaleString('default', { weekday: 'short' })}, ${month} ${dayStr}`;
        // debugger
        return formatedDate;
    }

    getOrdinalSuffix(day: number): string {
        const j = day % 10;
        const k = day % 100;
        if (j == 1 && k != 11) {
            return 'st';
        }
        if (j == 2 && k != 12) {
            return 'nd';
        }
        if (j == 3 && k != 13) {
            return 'rd';
        }
        return 'th';
    }

    public openDateTimeModal(): void {
        // const dialogRef = this.dialog.open(DateTimeSelectComponent, {
        //     data: {
        //         currentDate: this.currentDate,
        //         pickupTime: this.pickupTime,
        //         timeZoneAbbrev: this.timeZoneAbbrev,
        //         pickupDate: this.pickupDate,
        //     },
        // });

        // New Code
        console.log(this.pickupNow.nativeElement)
        let dialogRef

        // console.log("isNowwwwwwwwwwwww", this.isNow);


        if (this.isNow)
            this.initPickupDateTime();
        // 
        this.pickupTime.hours     // hours
        this.pickupTime.minutes   // minutes
        this.pickupTime.period    // PM or AM

        this.pickupDate           // 
        this.timeZoneAbbrev
        this.currentDate
        // 


        if (!this.isMobile) {
            dialogRef = this.dialog.open(DateTimeSelectComponent, {
                width: '350px',
                autoFocus: false,
                panelClass: 'dateTimeSelect-custom-dialog',
                data: {
                    currentDate: this.currentDate,
                    pickupTime: this.pickupTime,
                    timeZoneAbbrev: this.timeZoneAbbrev,
                    pickupDate: this.pickupDate,
                },
                position: {
                    left: this.pickupNow.nativeElement.offsetLeft + 16 + 'px',
                    top: this.pickupNow.nativeElement.offsetTop + this.pickupNow.nativeElement.offsetHeight + 'px'
                }
            });
        } else {
            dialogRef = this.dialog.open(DateTimeSelectComponent, {
                width: '350px',
                autoFocus: false,
                panelClass: 'dateTimeSelect-custom-dialog',
                data: {
                    currentDate: this.currentDate,
                    pickupTime: this.pickupTime,
                    timeZoneAbbrev: this.timeZoneAbbrev,
                    pickupDate: this.pickupDate,
                }
            });
        }

        // 

        dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                const pickupDate = result.pickupDate;
                const pickupTime = result.pickupTime;
                const reset = result.reset;

                this.pickupDate = pickupDate;
                this.pickupTime = pickupTime;


                if (reset) {
                    this.isNow = true;
                    this.selectedDateTimeShow = ""
                    this.initPickupDateTime()

                } else {
                    this.isNow = false;
                    console.log("pickupDate=======pickupTime=====", this.formatDate(this.pickupDate), this.pickupTime)
                }

                this.setPickupDateTime();
            } else {
                if (this.pickupDate == null)
                    this.isNow = !this.isNow
            }
        });
    }

    private clearFare(): void {
        this.displayFare = null;
        this.tripDetailsService.clearFare();
    }

    public changePickup(): void {
        // 
        // this.isNow = !this.isNow;
        // if (!this.isNow) {
        // this.openDateTimeModal();
        // }
        // 

        // this.isNow = false;
        // this.isNow = !this.isNow;
        // if (!this.isNow) {
        this.openDateTimeModal();
        // }
    }

    private setPickupDateTime(): void {
        console.log('calling setPickupDateTime');
        this.clearFare();
        if (this.isNow && this.selectedVehicleType) {
            this.tripDetailsService.setEta(this.selectedVehicleType.eta);
        }

        let tempPickupDate = String(this.formatDate(this.pickupDate))
        tempPickupDate = tempPickupDate.substring(0, tempPickupDate.length - 2)

        let tempHours = String(this.pickupTime.hours).length == 1 ? "0" + String(this.pickupTime.hours) : String(this.pickupTime.hours);
        let tempMins = String(this.pickupTime.minutes).length == 1 ? "0" + String(this.pickupTime.minutes) : String(this.pickupTime.minutes);

        this.selectedDateTimeShow = tempPickupDate + " at " + tempHours + ":" + tempMins + " " + String(this.pickupTime.period);

        this.tripDetailsService.setPickupDateTime(
            this.pickupDate,
            this.pickupTime,
            this.isNow
        );
    }

    public dragging(): void {
        console.log("dragging")
        const top =
            this.rideDetailsContainer.nativeElement.getBoundingClientRect().top;
        if (top <= 1) {
            this.allowScroll = true;
        } else {
            this.allowScroll = false;
        }
    }

    public dragDropped(event: CdkDragDrop<any>): void {
        console.log("dragDroppedppppppppppppp")
        const direction = event.currentIndex > event.previousIndex ? 'down' : 'up';
        console.log(`Dragged direction: ${direction}`);
    }

    // when click drag bar
    public onClickDragBar(): void {
        this.isSwipedUp = !this.isSwipedUp
        console.log("onClickDragBar")
    }

    public onInputNoteDriver(event: any): void {
        this.noteDriver = event.target.value;
        this.nextBtnState()
    }

    public onFocusOtherInputs(field: string): void {

        if (!this.isSwipedUp)
            this.onClickDragBar();

        if (field == "passenger")
            this.rideDetailsSmallContainer.nativeElement.scrollTop = 380;
        else if (field == "email")
            this.rideDetailsSmallContainer.nativeElement.scrollTop = 498;
        else if (field == "note")
            this.rideDetailsSmallContainer.nativeElement.scrollTop = 535;

    }

    public canDrag(): boolean {

        if (
            this.scrollPosition != 0)
            return false;   // drag enable
        else
            return true;        // drag

        // if (this.disableDrag) {
        //     console.log("canDrag1111", false)
        //     return false;
        // } else if (
        //     this.rideDetailsContainer &&
        //     this.rideDetailsContainer.nativeElement.getBoundingClientRect()
        //         .top <= 1
        // ) {
        //     console.log("canDrag2222", false)
        //     if(this.scrollPosition > 0)
        //         return false;

        //     return true;
        // } else {
        //     if (this.rideDetailsContainer) {
        //         this.rideDetailsContainer.nativeElement.scrollTop = 0;
        //     }

        //     console.log("canDrag", true)
        //     // if(this.rideDetailsContainer)
        //     //     console.log(this.rideDetailsContainer.nativeElement.getBoundingClientRect()
        //     //     .top)

        //     if(this.rideDetailsContainer && this.rideDetailsContainer.nativeElement.getBoundingClientRect()
        //     .top <= 1 &&
        //     this.scrollPosition == 0)
        //         return false;
        //     else
        //         return true;
        // }
    }

    public onScroll(): void {
        this.scrollPosition = this.rideDetailsContainer.nativeElement.scrollTop;
    }
}
