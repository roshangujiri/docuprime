import { LightningElement, api, track } from 'lwc';
import { formatDate } from 'c/utils';

/**
 * Displays correct data type cell based on input.
 */
export default class DataTypeCell extends LightningElement {

    @api cellData;
    @api sectionId;
    @track currentCellData = this.cellData;
    @track options = [];

    handleDataChange(event) {
        var inputValue = event.target.value;
        if(this.cellData.type === 'Date') {
            inputValue = formatDate(event.target.value);
        } else if(this.cellData.type === 'Textarea') {
            inputValue = inputValue.split(/\n/).join('<br>');
        }
        let tempCellData = this.cellData;
        const selectedEvent = new CustomEvent("fieldvaluechange", {
            detail: {sectionId: this.sectionId, 
                    orderSequence: tempCellData.orderSequence, 
                    placeholderContent: tempCellData.placeholderContent, 
                    value: inputValue}
        });
        this.dispatchEvent(selectedEvent);
    }

    get isSelectText() {
        return this.cellData.type === "String";
    }

    get isSelectDate() {
        return this.cellData.type === "Date";
    }

    get isSelectTextarea() {
        return this.cellData.type === "Textarea";
    }

    get isSelectNumber() {
        return this.cellData.type === "Number";
    }
    get isSelectTelephone() {
        return this.cellData.type === "tel";
    }

    get isSelectBoolean() {
        return this.cellData.type === "Checkbox";
    }

    get isSelectPicklist() {
        if(this.cellData.hasOwnProperty('picklistValues')) {
            this.options = this.cellData.picklistValues.split(/\n/).map(plValue => {
                return {
                    label: plValue,
                    value: plValue
                };
            });
        }
        return this.cellData.type === "Picklist";
    }

    @api validateFields() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input').forEach((element, index) => {
            element.reportValidity();
            if(isValid) {
                isValid = element.checkValidity();
            }
        });
        this.template.querySelectorAll('lightning-combobox').forEach((element, index) => {
            element.reportValidity();
            if(isValid) {
                isValid = element.checkValidity();
            }
        });
        return isValid;
    }
}