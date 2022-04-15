import { LightningElement, track, api } from 'lwc';

export default class DataSourceList extends LightningElement {
    @api objectName;
    @track dataSourceList
    connectedCallback() {
        console.log('--=-- inside the connected call back ')
        let objectName = JSON.parse(JSON.stringify(this.objectName));
        this.dataSourceList = [
            {
                index: 1,
                label: objectName,
                type: 'object'

            },
            {
                index: 2,
                label: 'Soql',
                type: 'query',
            },
            {
                index: 3,
                label: 'Rest Service',
                type: 'restApi'
            },
            {
                index: 4,
                label: 'Apex Class',
                type: 'className'
            },
            {
                index: 5,
                label: '200 OK Channel',
                type: 'channelName'
            }
        ];
    }

    isSourceTypeOpen = true;
    divClass = "slds-split-view_container slds-is-open";
    isOpenSideBad = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-open';
    articleAreaHidden = 'false';
    HandleCloseSideBar() {
        this.divClass = 'slds-split-view_container slds-is-closed';
        this.isOpenSideBad = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-closed';
        this.articleAreaHidden = 'true'
        this.isSourceTypeOpen = false;
        this.dispatchEvent(new CustomEvent('selectclose', {
            detail: { isSourceTypeOpen: this.isSourceTypeOpen },
            bubbles: true
        }))
    }
    handleClickDataSource(event) {
        let dataSourceType = event.target.dataset.item;
        let dataSourceLabel = event.target.dataset.name;
        this.dispatchEvent(new CustomEvent('selecteddatasource', {
            detail: { sourceType: dataSourceType, sourceLabel: dataSourceLabel, isEditTemplate: false },
            bubbles: true
        }))
    }
}