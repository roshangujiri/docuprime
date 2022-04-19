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
var pageLoaded = false;
export default class RichTextEditor extends LightningElement {

    // @track _jsonEditorData = {}
    // @api
    // get jsonEditorData() {
    //     return this._jsonEditorData
    // }
    @api jsonEditorData;



    // set jsonEditorData(value) {
    //     this._jsonEditorData = value;
    //     console.log('set json' + JSON.stringify(this._jsonEditorData))
    //     if (pageLoaded) {
    //         console.log('--=-- insdie the page load')
    //         editor.set(value);
    //         // this.createEditor();
    //     }
    //     else {
    //         console.log('--=-- inside the else page load')
    //     }
    // }
    loadingSpinner = false;
    @api containerClass;
    @track initialJson = {
        // "data": JSON.parse(`{}`),
        // "convertTo": "pdf"
    };
    @track jsonDataDetails;
    renderedCallback() {
        console.log('render call back in rich text ');
        this.template.querySelector('[data-id="jsoneditor"]').className = `${this.containerClass}`;
        //  this.initialJson.data = this.jsonEditorData;
        Promise.all([
            loadScript(this, jsonEditorResource + '/JsonEditor/jsoneditor.min.js'),
            loadStyle(this, jsonEditorResource + '/JsonEditor/jsoneditor.min.css'),
        ]).then(() => {
            pageLoaded = true
            console.log('pageLoaded' + pageLoaded)
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
        editor.set(this.jsonEditorData);
        // get json
        const updatedJson = editor.get();
        // console.log('--=-- updated Json is --=--' + JSON.stringify(updatedJson));
        // this.dispatchEvent(new CustomEvent('updatedjson', {
        //     detail: { updatedJsonData: updatedJson },
        //     bubbles: true
        // }))
    }
    // @api getData() {
    //     console.log("get payload data called");
    //     const getDataEvent = new CustomEvent("getdata", {
    //         detail: {
    //             json: editor.get()
    //         }
    //     });
    //     this.dispatchEvent(getDataEvent);
    // }

    handeleChange(event) {
        // let jsonChangeData = event.target.value;
        const getDataEvent = new CustomEvent("getdata", {
            detail: {
                json: editor.get()
            }
        });
        this.dispatchEvent(getDataEvent);
        console.log('--=-- editor get the data  --=--' + JSON.stringify(editor.get()))
    }

}