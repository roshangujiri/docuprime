/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
import { LightningElement, api, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { requestWrapperForRender, carboneRenderUrl } from 'c/utils';
import jsonEditorResource from '@salesforce/resourceUrl/jsonEditor';
let editor;

// import richTextEditor from '@salesforce/resourceUrl/richTextEditor';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RichTextEditor extends LightningElement {

    @api jsonEditorData;
    loadingSpinner = false;
    @api containerClass;
    @track initialJson = {
        "data": JSON.parse(`{}`),
        "convertTo": "pdf"
    };

    @track jsonDataDetails;
    renderedCallback() {
        // console.log('--=-- jsonEditire data is --=--' + JSON.stringify(this.jsonEditorData));
        // this.jsonDataDetails = JSON.parse(JSON.stringify(this.initialJson))
        console.log('--=-- type of json editor --=--' + typeof (this.jsonEditorData))
        this.template.querySelector('[data-id="jsoneditor"]').className = `${this.containerClass}`;
        this.initialJson.data = this.jsonEditorData;
        Promise.all([
            loadScript(this, jsonEditorResource + '/JsonEditor/jsoneditor.min.js'),
            loadStyle(this, jsonEditorResource + '/JsonEditor/jsoneditor.min.css'),
        ]).then(() => {
            console.log('Files loaded');
            this.createEditor();
        })
            .catch(error => {
                console.log('--inside the error block --=--');
                console.log(JSON.stringify(error));
            });
    }
    createEditor() {
        // create the editor
        const container = this.template.querySelector(`[data-id="jsoneditor"]`);
        var options = {
            modes: ['text', 'code', 'tree', 'form', 'view'],
            mode: 'code'
        };
        editor = new JSONEditor(container, options);
        // // set json
        // this.initialJson = {
        //     "data": JSON.parse(`{}`),
        //     "convertTo": "pdf"
        // }
        if (this.jsonData != null && this.jsonData != '') {
            this.initialJson = JSON.parse(this.jsonData);
        }
        editor.set(this.initialJson);
        // get json
        const updatedJson = editor.get();
        this.dispatchEvent(new CustomEvent('updatedjson', {
            detail: { updatedJsonData: updatedJson },
            bubbles: true
        }))

    }
    @api getData() {
        console.log("get payload data called");
        const getDataEvent = new CustomEvent("getdata", {
            detail: {
                json: editor.get()
            }
        });
        this.dispatchEvent(getDataEvent);
    }

}