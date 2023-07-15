import { Component,  ViewEncapsulation , Inject, OnInit,     ViewChild,     ElementRef  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectAddressService } from '../../shared/select-address.service';

@Component({
    selector: 'app-bookride-confirmation-modal',
    templateUrl: './bookride-confirmation-modal.component.html',
    styleUrls: ['./bookride-confirmation-modal.component.css'],
})
export class BookRideConfirmationModalComponent {
    callDate: String = '04/26/2023';
    tripNbr: String = '00000';
    servicingCompany: String = '';
    companyPhone: String = '';
    message: String = '';
    zoneId: String = '';

    pickup: String = '';
    destination: String = '';
    passengerName: String = ''

    confirmationCode: String = '';
    fleet: String = '';

    constructor(
        public selectAddressService: SelectAddressService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    public ngOnInit(): void {
        this.confirmationCode = String(this.data.tripNbr);
        this.servicingCompany = (this.data.servicingCompany);
        this.companyPhone = (this.data.passengerPhone);
        this.message = (this.data.message);
        this.zoneId = String(this.data.zoneId);

        this.pickup = this.data.pickup;
        this.destination = this.data.destination;
        this.passengerName = this.data.passengerName;

        const isoDate = this.data.callDate;
        const dateObj = new Date(isoDate);
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0"); // Add leading zero using padStart()
        const year = dateObj.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        this.callDate = formattedDate;

        this.fleet = 'ASC' + "(call " + this.data.companyPhone + " to update or cancel)";

    }

    public cancelRide(): void {
        // this.selectAddressService.cancelRide(Number(this.tripCode));
    }
}
