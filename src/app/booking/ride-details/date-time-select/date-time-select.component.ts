import { Component, ViewEncapsulation , Inject, OnInit,     ViewChild,     ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    ModalComponent,
    ModalService,
} from 'src/app/shared/Modal/Modal.service';
import { SharedService } from 'src/app/shared/shared.service';
import { TripDetailsService } from '../../shared/trip-details.service';
import { ExampleHeader } from './example-header.component';

@Component({
    selector: 'app-date-time-select',
    templateUrl: './date-time-select.component.html',
    styleUrls: ['./date-time-select.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class DateTimeSelectComponent {
    HOURS: number[] = [];
    MINUTES: number[] = [];
    pickupDate: string;
    currentDate: Date;
    maxDate: Date;
    pickupTime: any = {
        hours: 0,
        minutes: 0,
        period: 'AM',
    };
    timeZoneAbbrev: string = '';
    zoneId: string;

    formatedDate = '';
    exampleHeader = ExampleHeader;

    warningLessThan45 = false;

    @ViewChild('picker') picker: ElementRef

    constructor(
        private tripDetailsService: TripDetailsService,
        private sharedService: SharedService,
        private dialogRef: MatDialogRef<ModalComponent>,
        private modalService: ModalService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    public ngOnInit(): void {
        for (let i = 1; i < 13; i++) {
            this.HOURS.push(i);
        }

        for (let i = 0; i < 56; i += 5) {
            this.MINUTES.push(i);
        }
        console.log(this.data);
        this.currentDate = this.data.currentDate;
        const dateAfter60Days = new Date(this.currentDate.getTime() + 60 * 24 * 60 * 60 * 1000);
        this.maxDate = dateAfter60Days;
        
        this.pickupTime = JSON.parse(JSON.stringify(this.data.pickupTime));
        this.timeZoneAbbrev = this.data.timeZoneAbbrev;
        this.pickupDate = this.data.pickupDate;
        this.zoneId = this.tripDetailsService.zoneId;
        this.formatDate(new Date(this.data.pickupDate));
    }

    public changePeriod(): void {
        this.pickupTime.period === 'AM'
            ? (this.pickupTime.period = 'PM')
            : (this.pickupTime.period = 'AM');
    }
    public formatTimeValue(n: number): string {
        return n < 10 ? `0${n}` : `${n}`;
    }

    public resetDateTime(): void {
        this.warningLessThan45 = false;
        this.formatDate(new Date(this.data.pickupDate));
        this.pickupTime = JSON.parse(JSON.stringify(this.data.pickupTime));

        this.dialogRef.close({
            pickupDate: this.pickupDate,
            pickupTime: this.pickupTime,
            reset: true
        });
    }

    public setDateTime(): void {
        const currentDateUTC = this.sharedService.getCurrentTimeInUTC(
            this.zoneId
        );
        const pickupDateUTC = this.sharedService.convertTimeToUTC(
            this.zoneId,
            new Date(this.pickupDate),
            this.pickupTime
        );

        let currentDate = new Date(currentDateUTC);
        currentDate.setMinutes(currentDate.getMinutes() + 45);
        const pickupDate = new Date(pickupDateUTC);
        // console.log(currentDateUTC);
        // console.log(pickupDateUTC);
        // console.log(new Date(currentDateUTC));
        // console.log(new Date(pickupDateUTC));
        // console.log(new Date(pickupDateUTC) < new Date(currentDateUTC));
        if (pickupDate < currentDate) {
            this.warningLessThan45 = true;
            console.log('================pickup in the past');
            // this.modalService.openModal(
            //     '',
            //     'Scheduled time must be at least 45 minutes in the future. If you need a ride earlier than that, please choose the "Pickup Now" option.',
            //     false
            // );
        } else {
            console.log('pickup valid');
            this.warningLessThan45 = false;
            this.dialogRef.close({
                pickupDate: this.pickupDate,
                pickupTime: this.pickupTime,
                reset: false
            });
        }

        // this.dialogRef.close({
        //     pickupDate: this.pickupDate,
        //     pickupTime: this.pickupTime,
        // });
    }

    public close(): void {
        this.dialogRef.close({
            pickupDate: this.pickupDate,
            pickupTime: this.pickupTime,
        });
    }

    formatDate(date: Date): string {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const suffix = this.getOrdinalSuffix(day);
        // const dayStr = `${day}${suffix}`;
        const dayStr = `${day}`;
        this.formatedDate = `${date.toLocaleString('default', { weekday: 'short' })}, ${month} ${dayStr}`;
        // debugger
        return this.formatedDate;
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
      
    public getSuffix(dateNum: string): string {
        const num = parseInt(dateNum);
        if (num >= 11 && num <= 13) {
        return 'th';
        }
        switch (num % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
        }
    }

    public onDateChanged(sss: any) {
        console.log("==============", sss)
    }

    public modelChanged(date: any) {
        // var theDate = new Date(Date.parse(date));
        // const localDate = theDate.toLocaleString().split(" ");
    
        // console.log("localdate", this.formatDate(theDate));
        // this.pickupDate = this.formatDate(theDate);
        var theDate = new Date(Date.parse(date));
        const localDate = theDate.toLocaleString().split(" ");
    
        console.log("localdate", this.formatDate(theDate));
        // this.pickupDate = this.formatDate(theDate);
        // this.picker.nativeElement.value = this.pickupDate;
    }

    // public dateChanged(date: Moment) {
    //     this.formattedDate = this.formatDate(date);
    // }

}
