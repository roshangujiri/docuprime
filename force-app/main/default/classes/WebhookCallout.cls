public class WebhookCallout {
    @future(callout=true)
    public static void makeGetCalloutForEsignBulkified(
        String esignWrapperJson,
        String webhookURL) 
    {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(webhookURL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setBody(esignWrapperJson);
        HttpResponse response = http.send(request);
        if(response.getStatusCode() != 200) {
        } else {
        }
    }
}