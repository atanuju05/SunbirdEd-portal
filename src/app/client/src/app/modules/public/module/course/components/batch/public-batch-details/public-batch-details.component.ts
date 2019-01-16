
import { takeUntil } from 'rxjs/operators';
import { CourseBatchService } from '@sunbird/learn';
import { Router } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ResourceService, ServerResponse, ToasterService, BrowserCacheTtlService } from '@sunbird/shared';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { UserService } from '@sunbird/core';
import { CacheService } from 'ng2-cache-service';


@Component({
  selector: 'app-public-batch-details',
  templateUrl: './public-batch-details.component.html',
  styleUrls: ['./public-batch-details.component.scss']
})
export class PublicBatchDetailsComponent implements OnInit, OnDestroy {
  public unsubscribe = new Subject<void>();
  batchStatus: Number;
  @Input() courseId: string;
  @Input() courseHierarchy: any;

  public baseUrl = '';
  public enrollClickedId = '';
  public showLoginModal = false;
  batchList = [];
  showError = false;
  showBatchList = false;
  statusOptions = [
    { name: 'Ongoing', value: 1 },
    { name: 'Upcoming', value: 0 }
  ];
  todayDate = moment(new Date()).format('YYYY-MM-DD');
  constructor(private browserCacheTtlService: BrowserCacheTtlService, private cacheService: CacheService,
    public resourceService: ResourceService, public courseBatchService: CourseBatchService, public toasterService: ToasterService,
    public router: Router, public userService: UserService) {
    this.batchStatus = this.statusOptions[0].value;
  }

  ngOnInit() {
    this.getAllBatchDetails();
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  getAllBatchDetails() {
    this.showBatchList = false;
    this.showError = false;
    this.batchList = [];
    const searchParams: any = {
      filters: {
        status: this.batchStatus.toString(),
        courseId: this.courseId
      },
      offset: 0,
      sort_by: { createdDate: 'desc' }
    };
     searchParams.filters.enrollmentType = 'open';
     this.courseBatchService.getAllBatchDetails(searchParams).pipe(
      takeUntil(this.unsubscribe))
      .subscribe((data: ServerResponse) => {
        if (data.result.response.content && data.result.response.content.length > 0) {
          this.batchList = data.result.response.content;
        }
        this.showBatchList = true;
      },
      (err: ServerResponse) => {
        this.showError = true;
        this.toasterService.error(this.resourceService.messages.fmsg.m0004);
      });
  }

  enrollBatch(batch) {
    this.baseUrl = '/learn/course/' + this.courseId;
    this.enrollClickedId = batch.identifier;
    if (!this.userService.loggedIn) {
        this.showLoginModal = true;
    } else {
      this.router.navigate([this.baseUrl], { queryParams: { batch: this.enrollClickedId }});
    }
  }

  onLoginClick () {
    this.cacheService.set('postLoginRedirectUrl', {redirectUrl: this.baseUrl, queryParams: {batch: this.enrollClickedId}} ,
      { maxAge: this.browserCacheTtlService.browserCacheTtl});
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}