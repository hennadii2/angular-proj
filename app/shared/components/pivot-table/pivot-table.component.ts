import { Component, ViewChild, OnInit, SimpleChanges, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { NbToastrService } from '@nebular/theme';
import { WebDataRocksPivot } from "../../../webdatarocks/webdatarocks.angular4";

@Component({
	selector: 'app-pivot-table',
	templateUrl: './pivot-table.component.html',
	styleUrls: ['./pivot-table.component.scss']
})
export class PivotTableComponent implements OnInit {
	@Input() dataSourceEndpoint: string = '';
	@Input() sliceEndpoint: string = '';
	@Input() hideToolbar: boolean = false;
	@Input() isDashboardElement: boolean = false;
	@Input() title: string;

	@ViewChild('pivotTable') pivotTableWidget: WebDataRocksPivot;
	
	constructor (
		private dataDrivenService: DataDrivenService,
		private toastrService: NbToastrService
	) {
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
	}
	
	onReportComplete(): void {
    this.dataDrivenService
      .getData(this.dataSourceEndpoint)
      .subscribe(res => {
      if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}

      const dataSource = res.data
      const pivotReportApiEndpoint = ''

      this.dataDrivenService
        .getData(this.sliceEndpoint)
        .subscribe(repRes => {
        if (repRes.error) {
  				this.toastrService.danger(repRes.error.type, "Error");
  			}

        const requestJson = repRes.report

        requestJson.dataSource = {
          "data": res.data
        }

        this.pivotTableWidget.webDataRocks.off("reportcomplete")
        this.pivotTableWidget.webDataRocks.setReport(requestJson)
				this.pivotTableWidget.webDataRocks.refresh()

				window.dispatchEvent(new Event('resize'));
  		}, err => {
  			this.toastrService.danger(err.message, "Error");
  		})
		}, err => {
			this.toastrService.danger(err.message, "Error");
		})
  }
}
