import { Component,  ViewEncapsulation , Inject, OnInit,     ViewChild,     ElementRef  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectAddressService } from '../../shared/select-address.service';

@Component({
    selector: 'app-gettripcode-confirmation-modal',
    templateUrl: './gettripcode-confirmation-modal.component.html',
    styleUrls: ['./gettripcode-confirmation-modal.component.css'],
})
export class GetTripCodeConfirmationModalComponent {
    tripCode: String = '00000';

    constructor(
        public selectAddressService: SelectAddressService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    public ngOnInit(): void {
        this.tripCode = String(this.data.tripCode)
    }

    public cancelRide(): void {
        this.selectAddressService.cancelRide(Number(this.tripCode));
    }
}
