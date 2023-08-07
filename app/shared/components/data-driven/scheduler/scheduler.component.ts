import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation, ViewChild, SystemJsNgModuleLoaderConfig, EventEmitter, Output, Renderer } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject, Scheduler } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { OnClick, ButtonType, PageSize, FormItemLabel, FormItemType, KanbanResourceType, KanbanColumnType, KanbanSourceType, SchedulerAppointmentField, PageType, TypeView } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { jqxSchedulerComponent } from 'jqwidgets-ng/jqxscheduler';
import * as moment from 'moment';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { DataDrivenModalEditSchedulerComponent } from '../modal/edit-scheduler/edit-scheduler.component';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { LanguageService } from 'src/app/shared/services/language.service';

const DATE_FORMAT = 'DD/MM/YY';
const TIME_FORMAT = 'HH:mm';
const DT_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;
const WORKING_START_HOUR = "8";
const WORKING_END_HOUR = "18";
const DUMMY_PREFIX = "dummy_";

@Component({
	selector: 'app-data-driven-scheduler',
	templateUrl: './scheduler.component.html',
	styleUrls: ['./scheduler.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DataDrivenSchedulerComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;
    PageSize = PageSize;
    TypeView = TypeView;


	objectKeys = Object.keys;

    isProccessing: boolean = false;
    
	@Input() endpoint: string;
	@Input() onclick: OnClick;
	@Input() buttons: ButtonType[]=[];
	@Input() form_class = '';
	@Input() default_disabled_buttons: ButtonType[]=[];

	@Input() selectedId;
    disabled_buttons: ButtonType[]=[ButtonType.Edit];
    @Input() typeview: TypeView[] = [];

	@Output() onExit = new EventEmitter();

    items: any[] =[];
    labels: FormItemLabel[] = [];
    blocks: any[]=[];
    colors: any = {};
    views: any[] = [
        { type: "dayView", 
            text: "Day",
            workTime:{ fromDayOfWeek: 1, toDayOfWeek: 5, fromHour: WORKING_START_HOUR, toHour: WORKING_END_HOUR }
        },
        { type: 'weekView', 
            text: "Week",
            workTime:{ fromDayOfWeek: 1, toDayOfWeek: 5, fromHour: WORKING_START_HOUR, toHour: WORKING_END_HOUR }
        },
        { type: "monthView", text: "Month" },
        { type: "agendaView", text: "Agenda" }
    ];  
    view: string;
    date: any;
    from_date: any;
    to_date: any;
    source: any;
    dataAdapter: any;
    dataFields: any;
    appointmentDataFields: any;
    all_resources: any;

    resources: any;

    schedulerSettings: jqwidgets.SchedulerOptions;

    @ViewChild('schedulerReference') jqxScheduler: jqxSchedulerComponent;

	componentDestroyed = new Subject(); // Component Destroy

	constructor(
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private deviceService: DeviceDetectorService,
		private tokenStorage: TokenStorage,
        private renderer: Renderer,
        private modalService: NgbModal,
        private langService: LanguageService
	) {
        //console.log(this.langService.instant("SCHEDULER.DAY"));
        //console.log(this.langService.getLang());
        this.views[0].text = this.langService.instant("SCHEDULER.DAY");
        this.views[1].text = this.langService.instant("SCHEDULER.WEEK");
        this.views[2].text = this.langService.instant("SCHEDULER.MONTH");
        this.views[3].text = this.langService.instant("SCHEDULER.AGENDA");
	}

    localization = {
     
        // the first day of the week (0 = Sunday, 1 = Monday, etc)
        firstDay: 1,
        days: {
            // full day names
            names: [ this.langService.instant("SCHEDULER.SUNDAY"), this.langService.instant("SCHEDULER.MONDAY"), this.langService.instant("SCHEDULER.TUESDAY"), this.langService.instant("SCHEDULER.WEDNESDAY"), this.langService.instant("SCHEDULER.THURSDAY"), this.langService.instant("SCHEDULER.FRIDAY"), this.langService.instant("SCHEDULER.SATURDAY")]
        },
        months: {
            // full month names (13 months for lunar calendards -- 13th month should be '' if not lunar)
            names: [this.langService.instant("SCHEDULER.JANUARY"),this.langService.instant("SCHEDULER.FEBRUARY"),this.langService.instant("SCHEDULER.MARCH"),this.langService.instant("SCHEDULER.APRIL"),this.langService.instant("SCHEDULER.MAY"),this.langService.instant("SCHEDULER.JUNE"),this.langService.instant("SCHEDULER.JULY"),this.langService.instant("SCHEDULER.AUGUST"),this.langService.instant("SCHEDULER.SEPTEMBER"),this.langService.instant("SCHEDULER.OCTOBER"),this.langService.instant("SCHEDULER.NOVEMBER"),this.langService.instant("SCHEDULER.DECEMBER"),''],
            namesAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', '']
        }, 
        toolBarPreviousButtonString: this.langService.instant("SCHEDULER.PREVIOUS"),
        toolBarNextButtonString: this.langService.instant("SCHEDULER.NEXT"),
        todayString: this.langService.instant("SCHEDULER.TODAY")
    }

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['endpoint']) {
			if (this.endpoint) {
                //this.getSchedulerData(this.endpoint, true);
                this.date = new Date();
                [this.from_date, this.to_date] = this.getFirstAndLastDayofWeeks(this.date);
                let from = moment(this.from_date).format(DT_FORMAT);
                let to = moment(this.to_date).format(DT_FORMAT);
                this.getSchedulerData(this.endpoint, from, to, true);
			}
		}

		if (changes['onclick']) {
			if (this.onclick.endpoint)  {

			}
		}           
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
        this.jqxScheduler.destroy();
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
    }
    


    getSchedulerData(url: string, from: any, to: any, is_label: boolean) {
		this.dataDrivenService.getSchedulerData(url, from, to, is_label).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
            }
            
            if (res.blocks) this.blocks = res.blocks;

            if (is_label) {
                this.labels = res.labels;
                this.appointmentDataFields = this.generateAppointmentDataFields(this.labels);
                this.dataFields = this.generateDataFields(this.labels);
                this.all_resources = this.generateAllResources(this.labels);

                this.items = this.generateDummyItems(this.all_resources);
            }

            let items = res.data.map(item => {
                return this.convertItem(item);
            });

            items = _.orderBy(items, [this.appointmentDataFields[SchedulerAppointmentField.ResourceId]]);

            // if (this.source) {
            //     let differenceItems = _.differenceBy(items, this.items, "id");
            //     this.addAppointments(differenceItems);
            // } else {
                let prev_length = this.items.length;
                this.items = _.unionBy(this.items, items, "id"); //_.isEqual

                if (prev_length < this.items.length)  {
                    if (this.source) {
                        this.refreshdata();
                    } else {
                        this.generateScheduler();
                    }
                }
            // }

		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
    }


	updateItem(url: string, data: any) {
        let updateData = _.cloneDeep(data);

        let fromDateField = this.appointmentDataFields[SchedulerAppointmentField.FromDate];
        let fromTimeField = this.appointmentDataFields[SchedulerAppointmentField.FromTime];
        let toDateField = this.appointmentDataFields[SchedulerAppointmentField.ToDate];
        let toTimeField = this.appointmentDataFields[SchedulerAppointmentField.ToTime];

        let ReIdField = this.appointmentDataFields[SchedulerAppointmentField.ResourceId];
        let ReValueField = this.appointmentDataFields[SchedulerAppointmentField.ResourceValue];
        if (updateData[SchedulerAppointmentField.From]) {
            [updateData[fromDateField], updateData[fromTimeField]] = this.convertDateTimeToString(updateData[SchedulerAppointmentField.From]);
        } 
        if (updateData[SchedulerAppointmentField.To]) {
            [updateData[toDateField], updateData[toTimeField]] = this.convertDateTimeToString(updateData[SchedulerAppointmentField.To]);
        }

        let resource = this.all_resources.find(re => re.option == updateData[ReIdField]);
        updateData[ReValueField] = resource ? resource.value : null;

		this.dataDrivenService.updateData(url, updateData).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			} else {
				this.toastrService.success("The data has been updated successfully!", "Success");
            }
            let index = this.items.findIndex(item =>  item.id == data.id);
            this.items[index] = updateData;

            // if (this.source) {
            //     this.refreshdata();
            // } else {
            //     this.generateScheduler();
            // }

		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
    }

    createItem(url: string, data: any) {

		this.dataDrivenService.createData(url, data).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error, "Error");
			} else {
				this.toastrService.success("The data has been created successfully!", "Success");
            }

            let newData: any = this.convertItem(res.data[0]);
            this.items.push(newData);
            this.jqxScheduler.addAppointment(newData);
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}

	deleteItem(url: string, id: string) {
		const modalRef = this.modalService.open(ModalConfirmComponent, {centered: true, draggableSelector: '.modal-header'});

        modalRef.result.then(result=>{
			if (result) {
				this.dataDrivenService.deleteData(`${url}/${id}`).subscribe(res=>{
					if (res.error) {
						this.toastrService.danger(res.error.type, "Error");
					} else {
						this.toastrService.success("The item has been deleted successfully!", "Success");
					}

                    let index = this.items.findIndex(item=> item.id == id);
                    this.items.splice(index, 1);

                    this.jqxScheduler.deleteAppointment(id);
				}, err=>{
					this.toastrService.danger(err.message, "Error");
				});
			}
		});
    }
    
    addAppointments(items) {
        items.forEach(item=>{
            if ( this.items.findIndex(it => it.id == item.id) == -1) {
                this.items.push(item);
                this.jqxScheduler.addAppointment(item);
            }
        });
    }

    addColorToItems(items) {
        items.forEach((item, index)=>{
            this.items[index] = this.addColorToItem(item);
        });
    }

    addColorToItem(item) {
        let updateItem: any = _.cloneDeep(item);
        if (!updateItem[SchedulerAppointmentField.Background]) {
            let resourceKey = this.appointmentDataFields[SchedulerAppointmentField.ResourceId];

            if (!this.colors[item[resourceKey]]) {
                this.colors[item[resourceKey]] = this.generateRandomColor();
            }
            updateItem[SchedulerAppointmentField.Background] =  this.colors[item[resourceKey]];
            updateItem[SchedulerAppointmentField.BorderColor] =  this.colors[item[resourceKey]];
        }

        return updateItem;
    }


    changeAppointmentId(newId: any, appointment: any) {
        let oldId = appointment['id'];
        Object.defineProperty(appointment.jqxAppointment.scheduler.appointmentsByKey, newId,
        Object.getOwnPropertyDescriptor(appointment.jqxAppointment.scheduler.appointmentsByKey, oldId));
        delete appointment.jqxAppointment.scheduler.appointmentsByKey[oldId];
        
        // Object.defineProperty(appointment.jqxAppointment.scheduler.changedAppointments, newId,
        // Object.getOwnPropertyDescriptor(appointment.jqxAppointment.scheduler.changedAppointments, oldId));
        // delete appointment.jqxAppointment.scheduler.changedAppointments[oldId];

        appointment.id = appointment.jqxAppointment.id = appointment.originalData.id = newId;
    }

    generateAllResources(labels: FormItemLabel[]) {
        let resouce_label = labels.find(label => label.widgettype == SchedulerAppointmentField.ResourceId);

        let all_resources = resouce_label.options;
        if (!all_resources) {
            all_resources = [];
            for (let i = 0; i < 10; i++) {
                all_resources.push({option: i.toString(), value: i.toString()});
            }
        }

        return all_resources;
    }

    generateDummyItems(all_resouces: any[]) {
        let dummyItems: any = [];

        let fromKey = this.appointmentDataFields[SchedulerAppointmentField.From];
        let toKey = this.appointmentDataFields[SchedulerAppointmentField.To];
        let resouceIdKey = this.appointmentDataFields[SchedulerAppointmentField.ResourceId];
        let resouceValueKey = this.appointmentDataFields[SchedulerAppointmentField.ResourceValue];
        let HiddenKey = this.appointmentDataFields[SchedulerAppointmentField.Hidden];


        all_resouces.forEach(resource =>{
            let dummyItem: any = {};
            dummyItem['id'] = DUMMY_PREFIX + resource['value'];
            dummyItem[fromKey] = new Date();
            dummyItem[toKey] = new Date();
            dummyItem[resouceIdKey] = resource['option'];
            dummyItem[resouceValueKey] = resource['value'];
            dummyItem[HiddenKey] = true;

            dummyItems.push(dummyItem);
        });

        return dummyItems;
    }
    

    refreshdata() {
        this.source.localData = this.items;
        this.dataAdapter = new jqx.dataAdapter(this.source)
    }

    schedulerReady = (): void => {
        //this.jqxScheduler.scrollTop(400);
    };

    BindingComplete(event) {
       this.jqxScheduler.scrollTop(400);
    }

    renderAppointment = (data) => {

        let appointment = data.appointment;
        if (appointment && appointment.id.indexOf(DUMMY_PREFIX) == 0) {
            //data.cssClass = "d-none position-absolute no-width";
            this.jqxScheduler.deleteAppointment(appointment.id);
            return data;
        }
        if (this.jqxScheduler) this.jqxScheduler.scrollTop(400);
    }
    
    getFirstAndLastDayofWeeks(date: Date) {
        let first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6

        let firstday = new Date(date.setDate(first));
        let lastday = new Date(date.setDate(last));

        return [firstday, lastday];
    }

    generateAppointmentDataFields(labels: FormItemLabel[]) {
        let fields = {};

        labels.forEach(label =>{
            if (label.widgettype) {
                fields[label.widgettype] = label.fieldname;
            } else {
                fields[label.fieldname] = label.fieldname;
            }

        });

        let fromIndex = labels.findIndex(l => l.widgettype == SchedulerAppointmentField.From);
        let toIndex = labels.findIndex(l => l.widgettype == SchedulerAppointmentField.To);
        let backIndex = labels.findIndex( l=> l.widgettype == SchedulerAppointmentField.Background);
        let borderIndex = labels.findIndex( l=> l.widgettype == SchedulerAppointmentField.BorderColor);
        let hiddenIndex = labels.findIndex( l=> l.widgettype == SchedulerAppointmentField.Hidden);
        if (fromIndex == -1) {
            fields[SchedulerAppointmentField.From] = SchedulerAppointmentField.From;
        }

        if (toIndex == -1) {
            fields[SchedulerAppointmentField.To] = SchedulerAppointmentField.To;
        }

        if (backIndex == -1) {
            fields[SchedulerAppointmentField.Background] = SchedulerAppointmentField.Background;
        }

        if (borderIndex == -1) {
            fields[SchedulerAppointmentField.BorderColor] = SchedulerAppointmentField.BorderColor;
        }

        if (hiddenIndex == -1) {
            fields[SchedulerAppointmentField.Hidden] = SchedulerAppointmentField.Hidden;
        }

        fields[SchedulerAppointmentField.ResourceValue] = fields[SchedulerAppointmentField.ResourceId];
        fields[SchedulerAppointmentField.ResourceId] = SchedulerAppointmentField.ResourceValue;


        return fields;
    }

    generateDataFields(labels: FormItemLabel[]) {
        let fields = [];
        labels.forEach(label =>{
            let field: any = {};
            field['name'] = label.fieldname;
            
            switch (label.inputtype) {
                case FormItemType.Text:
                    field['type'] = "string";
                    break;
                case FormItemType.Int:
                    field['type'] = "number";
                    break;
                case FormItemType.CheckBox:
                    field['type'] = "boolean";
                    break;
                case FormItemType.Date:
                    field['type'] = "date";
                    break;                    
                case FormItemType.Time:
                    field['type'] = "string";
                    break;
                default:
                    field['type'] = "string";
            }

            // if (field['name'] == this.appointmentDataFields[SchedulerAppointmentField.ResourceId]) {
            //     field['type'] = "string";
            // }
            fields.push(field);
        });
        fields.push({name: SchedulerAppointmentField.From, type: "date"});
        fields.push({name: SchedulerAppointmentField.To, type: "date"});
        fields.push({name: SchedulerAppointmentField.Background, type: "string"});
        fields.push({name: SchedulerAppointmentField.BorderColor, type: "string"});
        fields.push({name: SchedulerAppointmentField.Hidden, type: "boolean"});
        fields.push({name: SchedulerAppointmentField.ResourceValue, type: "string"});

        return fields;
    }

    generateSource(items: any[]) {
        let source = {
            dateType: "array",
            dataFields: this.dataFields,
            id: "id",
            localData: items
        };

        return source;
    }


    generateScheduler() {
        this.source = this.generateSource(this.items);
        this.dataAdapter = new jqx.dataAdapter(this.source);
        this.resources = {
            colorScheme: "scheme05",
            dataField: SchedulerAppointmentField.ResourceValue,
            source: new jqx.dataAdapter(this.source)
        };
        // this.schedulerSettings =
        // {
        //     width: '100%',
        //     height: '75vh',
        //     source: this.dataAdapter,
        //     view: this.view,
        //     showLegend: true,
        //     appointmentDataFields: this.appointmentDataFields,
        //     resources: this.resources,
        //     views: this.views
        // };

        // this.jqxScheduler.createComponent(this.schedulerSettings);
    }
    
    changeDate(event: any): void {
        // Do Something
        if (this.from_date == event.args.from && this.to_date == event.args.to) {
            return;
        }

        this.from_date = new Date(event.args.from.toString());
        this.to_date = new Date(event.args.to.toString());

        let from = moment(this.from_date).format(DT_FORMAT);
        let to = moment(this.to_date).format(DT_FORMAT);
    
        this.getSchedulerData(this.endpoint, from, to, false);
    }

    changeView(event: any): void {
        this.changeDate(event);
        if (this.jqxScheduler) this.jqxScheduler.scrollTop(400);
    }

    addAppointment(event: any) {

        let appointment = event.args.appointment;
        let appointments = this.jqxScheduler.getAppointments();
        let newData = this.items.find(item=> appointments.map(app=>app.id).indexOf(item.id) == -1);

        if (newData) this.changeAppointmentId(newData['id'], appointment);
        //this.createItem(this.onclick.endpoint, data);
    }

    deleteAppointment(event: any) {
        let deleteId = event.args.appointment.id;
        //this.deleteItem(this.onclick.endpoint, deleteId);
    }

    updateAppointment(event: any) {
        let data = event.args.appointment.originalData;
        this.updateItem(this.onclick.endpoint, data);
    }

    updateAppointmentByModal(item) {
        this.jqxScheduler.beginAppointmentsUpdate();
        Object.keys(this.appointmentDataFields).forEach(key=>{
            let appValue: any = this.jqxScheduler.getAppointmentProperty(item.id, key);
            let itemValue: any = item[this.appointmentDataFields[key]];
            if (key == SchedulerAppointmentField.From || key == SchedulerAppointmentField.To) {
                itemValue = new jqx.date(itemValue);
            }
            if (appValue != itemValue) this.jqxScheduler.setAppointmentProperty(item.id, key, itemValue);
        })

        this.jqxScheduler.endAppointmentsUpdate();

        let data = this.jqxScheduler.getAppointments().find(app=>app.id == item.id);

        this.updateItem(this.onclick.endpoint, item);
    }

    CellDoubleClick(event: any) {
        let startdt = new Date(event.args.date.toString());
        let enddt = this.addMinutes(startdt, 30);

        let data = {};
        data[SchedulerAppointmentField.From] = startdt;
        data[SchedulerAppointmentField.To] = enddt;
        this.editItem(true, data);
    }

    AppointmentDoubleClick(event: any) {
        let data = event.args.appointment.originalData;
        let item = this.items.find(it => it.id == data.id);

        this.editItem(false, item);
    }

    editItem(is_add: boolean, data: any = {}) {
        let fromDateField = this.appointmentDataFields[SchedulerAppointmentField.FromDate];
        let fromTimeField = this.appointmentDataFields[SchedulerAppointmentField.FromTime];
        let toDateField = this.appointmentDataFields[SchedulerAppointmentField.ToDate];
        let toTimeField = this.appointmentDataFields[SchedulerAppointmentField.ToTime];
 
        if (data[SchedulerAppointmentField.From]) {
            [data[fromDateField], data[fromTimeField]] = this.convertDateTimeToString(data[SchedulerAppointmentField.From]);
        } 
        if (data[SchedulerAppointmentField.To]) {
            [data[toDateField], data[toTimeField]] = this.convertDateTimeToString(data[SchedulerAppointmentField.To]);
        }

        const modalRef = this.modalService.open(DataDrivenModalEditSchedulerComponent, {centered: true, draggableSelector: '.modal-header', size: PageSize.Large});
        
        modalRef.componentInstance.labels = _.cloneDeep(this.labels);
        modalRef.componentInstance.blocks = this.blocks;
        modalRef.componentInstance.is_add = is_add;
        modalRef.componentInstance.data = data;
        modalRef.componentInstance.appointment_fields = this.appointmentDataFields;
		modalRef.result.then(result=>{
			if (result) {
                switch (result.operation) {
                    case "create":
                        this.createItem(this.endpoint, result.item);

                        break;
                    case "update":
                        let updateItem = this.convertItem(result.item);
                        this.updateAppointmentByModal(updateItem);
                        // this.updateItem(this.endpoint, updatedItem);
                        break;
                    case "delete":
                        this.deleteItem(this.endpoint, result.itemid);
                        break;
                }
			}
		});
	}

    clickButtonBar(button: ButtonType) {
        let data = {};
		switch (button) {
            case ButtonType.Add:
                let startdt = new Date();
                let enddt = this.addMinutes(startdt, 30);

                data[SchedulerAppointmentField.From] = startdt;
                data[SchedulerAppointmentField.To] = enddt;
                this.editItem(true, data);
				break;
			case ButtonType.Exit:
				this.onExit.next();
				break;
		}
    }

	getWidth() : any {
		if (document.body.offsetWidth > 850) {
			return '90%';
		}
		
		return 850;
	}
    
    getBrowserWidth() {
        return Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.offsetWidth,
          document.documentElement.clientWidth
        );
      }
      
    getBrowserHeight() {
        return Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.documentElement.clientHeight
        );
    }

    
	generateRandomColor() {
		var color = Math.floor(0x1000000 * Math.random()).toString(16);
		return '#' + ('000000' + color).slice(-6);
	}

    convertDateTimeToString(date: Date) {
        let dateStr = moment(date).format(DATE_FORMAT);
        let timeStr = moment(date).format(TIME_FORMAT);
        return [dateStr, timeStr];
    }

    convertItem(item: any) {

        let updateItem: any = _.cloneDeep(item);
        let resourceIdKey = this.appointmentDataFields[SchedulerAppointmentField.ResourceId];
        let resourceValueKey = this.appointmentDataFields[SchedulerAppointmentField.ResourceValue];

        let resource = this.all_resources.find(resource => resource.value == item[resourceValueKey]);


        let startdate = item[this.appointmentDataFields[SchedulerAppointmentField.FromDate]];
        let starttime = item[this.appointmentDataFields[SchedulerAppointmentField.FromTime]];

        let enddate = item[this.appointmentDataFields[SchedulerAppointmentField.FromDate]];
        let endtime = item[this.appointmentDataFields[SchedulerAppointmentField.ToTime]];


        updateItem[resourceIdKey] = resource ? resource.option : null;
        updateItem[SchedulerAppointmentField.From] = moment(`${startdate} ${starttime}`, DT_FORMAT).toDate();
        updateItem[SchedulerAppointmentField.To] = moment(`${enddate} ${endtime}`, DT_FORMAT).toDate();

        return updateItem;
    }

    addMinutes(dt, minutes) {
        return new Date(dt.getTime() + minutes*60000);
    }

    setView(typeview: TypeView){

        if (typeview == TypeView.Day) {
            let view = 'dayView'
            return view
        } 
        if (typeview == TypeView.Week) {
            let view = 'weekView'
            return view
        } 
        if (typeview == TypeView.Month) {
            let view = 'monthView'
            return view
        } 
        if (typeview == TypeView.Agenda) {
            let view = 'agendaView'
            return view
        } else {
            let view = 'weekView'
            return view
        }
    }

}
