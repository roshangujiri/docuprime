import { LightningElement, api, track } from 'lwc';
import ICGateway from "@salesforce/apex/ICGateway.executeMethod";
import { showError, carboneRenderUrl } from 'c/utils';
import carboneMetaDataDetails from '@salesforce/apex/DataSourceController.queryMetadata';
export default class IFrameComponent extends LightningElement {
    @track renderReportUrl;
    showSpinner = false
    @api externalTemplateId;
    @api jsonData;
    @api isInstallLwapic;
    connectedCallback() {
        this.renderReport();
    }
    renderReport() {
        if (this.isInstallLwapic) {
            this.showSpinner = true;
            //  let requestWrapper = requestWrapperForRender(this.externalTemplateId, JSON.parse(JSON.stringify(this.jsonData)));
            let requestWrapperForRender = {
                request: {
                    serviceName: `carbone_render`,
                    queryParams: `${this.externalTemplateId}`,
                    requestPayload: JSON.parse(JSON.stringify(this.jsonData))
                }
            }
            ICGateway({ requestStr: JSON.stringify(requestWrapperForRender) })
                .then((res) => {
                    console.log("inside the icGateway response");
                    console.log('response is ' + JSON.stringify(JSON.stringify(res)));
                    if (res.response[0].responseBody) {
                        let renderId = JSON.parse(res.response[0].responseBody).data.renderId;
                        this.renderReportUrl = carboneRenderUrl + '/' + renderId;
                        this.showSpinner = false;
                    }
                })
                .catch(err => {
                    showError(this, err.body.message);
                })
        }
        else {
            this.getRenderDetails(this.externalTemplateId);
        }
    }
    getRenderDetails(externalTemplateId) {
        this.loadingSpinner = true;
        carboneMetaDataDetails({ serviceName: 'Render_Template' })
            .then(data => {
                let EndpointUrl = data[0].Carbone_url__c + '/' + `${externalTemplateId}`;
                let method = data[0].Method__c;
                let carboneVersion = data[0].Carbone_Version__c;
                let authorizationToken = data[0].Authorization_Token__c;
                fetch(EndpointUrl, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorizationToken,
                        'carbone-version': carboneVersion
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify(this.jsonData)
                })
                    .then((response) => response.json())
                    .then((response) => {
                        let renderId = response.data.renderId;
                        this.loadingSpinner = false;
                        this.renderReportUrl = carboneRenderUrl + '/' + renderId;
                        this.showSpinner = false;
                    })
                    .catch(err => {
                        this.loadingSpinner = fale;
                        showError(this, err.body.message);
                    })
            })
            .catch(err => {
                this.loadingSpinner = fale;
                showError(this, err.body.message);

            })
    }
}