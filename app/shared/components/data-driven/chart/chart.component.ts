import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { NbToastrService } from '@nebular/theme';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { ChartType, ButtonType } from 'src/app/shared/models/data-driven.model';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';

const CHART_TIME_INTERVAL  = 10;
@Component({
	selector: 'app-data-driven-chart',
	templateUrl: './chart.component.html',
	styleUrls: ['./chart.component.scss'],
	//providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class DataDrivenChartComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ChartType = ChartType;
	objectKeys = Object.keys;

	@Input() id: any = -1;
	@Input() buttons;
	@Input() form_class = '';
	@Input() form_data: any;
	@Input() default_disabled_buttons: ButtonType[]=[];
	@Input() endpoint: string;
	@Input() chartType = ChartType.Column;
	@Input() isDashboardElement: boolean = false;
	@Input() title: string;

	disabled_buttons: ButtonType[]=[];

	chart: any;
	data: any[];
	sumData: any[];
	xAxis: any;
	lineSeriesGroup: any;
	columnSeriesGroup: any;
	pieSeriesGroups: any;
	piesData: any[];
	button_corner: number;

	@Output() onClickButtonBar = new EventEmitter();
	@Output() onExit = new EventEmitter();
	@Output() onChangeView = new EventEmitter();
	
	componentDestroyed = new Subject(); // Component Destroy
	constructor(
		private formBuilder: FormBuilder,
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private tokenStorage: TokenStorage
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['id'] || changes['endpoint'] || changes['form_data']) {
			this.getGraphData(this.endpoint, this.id,  this.form_data);
		}
	}

	ngDoCheck() {

	}

	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}

	getGraphData(url: string, id: any, data: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id, data);
		this.dataDrivenService.updateData(passed_url, data).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}
			
			this.chart = res.chart;
			if (!this.chart) return;
			this.sumData = this.generateSumData(this.chart.data);


			this.xAxis = this.generateXAxis(this.chart.legend);
			this.columnSeriesGroup = this.generateSeriesGroup(ChartType.Column, this.chart.legend, this.chart.axis, this.chart.max, this.chart.min);
			this.lineSeriesGroup = this.generateSeriesGroup(ChartType.Line, this.chart.legend, this.chart.axis, this.chart.cumul, this.chart.min);

			this.piesData = this.generatePiesData(this.chart.data, this.chart.legend);
			this.pieSeriesGroups = this.generatePieSeriesGroups(this.chart.legend);
			
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}

	getWidth() : any {
		if (document.body.offsetWidth < 850) {
			return '90%';
		}
		
		return 850;
	}

	generateXAxis(legends: any[]) {
		if (!legends || legends.length == 0) return {dataField: "", showGridLines: true};

		let xAxis = { 
			dataField: legends[0].name,
			showGridLines: true,
			tickMarks: { visible: true, interval: 1 },
			gridLinesInterval: { visible: true, interval: 1 },
			valuesOnTicks: false,
			padding: { bottom: 10 }
		}

		return xAxis;
	}

	generateSumData(data: any[]) {
		let sumData = [];
		data.forEach((item, index)=>{
			let sumItem = {};
			Object.keys(item).forEach((key, kIndex)=>{

				if (kIndex == 0) {
					sumItem[key]=item[key];
				} else {
					sumItem[key]=item[key] + (index == 0 ? 0 : sumData[index - 1][key]);
				}
			});

			sumData.push(sumItem);
		});

		return sumData;
	}


	generatePiesData(data: any[], legends: any[]) {

		let piesData = [];
		legends.forEach((legend, index) =>{
			if (index == 0) return;

			let pieData = [];

			pieData = data.map(item=>{
				var dataItem = {};
				dataItem[legends[0].name] = item[legends[0].name];
				dataItem[legend.name] = item[legend.name];
				return dataItem;
			});

			piesData.push(pieData);
		});

		return piesData;
	}

	generateSeriesGroup(chartType: ChartType, legends: any[], xAxisDesc: any, maxValue: number, minValue: number) {
		if (!legends || legends.length == 0) return {};
		let series = [];
		legends.forEach((legend, index)=>{
			if (index == 0) return;
			series.push({dataField: legend.name, displayText: legend.title});
		});
		let seriesGroups: any[] =
		[
			{
				type: chartType,
				columnsGapPercent: 30,
				seriesGapPercent: 0,
				valueAxis:
				{
					unitInterval: maxValue > 0 ? maxValue / 10 : CHART_TIME_INTERVAL,
					minValue: minValue,
					maxValue: maxValue,
					displayValueAxis: true,
					description: xAxisDesc,
					axisSize: 'auto',
					tickMarksColor: '#888888'
				},
				series: series
			}
		];

		return seriesGroups;
	}

	generatePieSeriesGroups(legends: any[]) {
		let pieSeriesGroups = [];
		legends.forEach((legend, index)=>{
			if (index == 0) return;
			pieSeriesGroups.push( this.generatePieSereiesGroup(legend.name, legends[0].name));
		});

		return pieSeriesGroups;
	}

	generatePieSereiesGroup(dataField: string, displayText: string) {
		let seriesGroups: any[] =
		[
			{
				type: ChartType.Pie,
				showLegend: true,
				showLabels: true, 
				enableSeriesToggle: true,
				series:
				[
					{
						dataField: dataField,
						displayText: displayText,
						showLabels: true,
						labelRadius: 160,
						labelLinesEnabled: true,
						labelLinesAngles: true,
						labelsAutoRotate: false,
						initialAngle: 0,
						radius: 125,
						minAngle: 0,
						maxAngle: 380,
						centerOffset: 0,
						offsetY: 170,
						// formatFunction: (value: any, itemIdx: any, serieIndex: any, groupIndex: any) => {
						// 	if (isNaN(value))
						// 		return value;
						// 	return value + '%';
						// }
					}
				]
			}
		];

		return seriesGroups;
	}


	changeChartType(chartType: ChartType) {
		this.chartType = chartType;
	}

	clickButtonBar(button: ButtonType) {
		if (button == ButtonType.Cancel || button == ButtonType.Exit) {
				this.onClickButtonBar.next(ButtonType.Exit);
				this.onExit.next();
		} else {
			this.onClickButtonBar.next(button);
		}
	}
}
