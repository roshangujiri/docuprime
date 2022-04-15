@isTest
private class WebhookCalloutTest {
    @isTest static void makeGetCalloutForEsignBulkifiedTest() {
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new WebhookCalloutHttpCalloutMockGenegrator()); 
        // This causes a fake response to be sent
        // from the class that implements HttpCalloutMock. 
        String esignWrapperJson = '[{"contentVersionId":"0682x000002wEouAAE","approverName":"Tom Ripley","approverEmail":"test@gmail.com"}]';
        String webhookURL = 'https://hook.integromat.com/jbem7amsmxffleh7yhvzs42rq3ruqg8a?service=Zoho+Esign';
        Test.startTest();
        List<Domain.ESignCalloutDataWrapper> esignWrapper = (List<Domain.ESignCalloutDataWrapper>)JSON.deserialize(esignWrapperJson, List<Domain.ESignCalloutDataWrapper>.class);
        WebhookCallout.makeGetCalloutForEsignBulkified(esignWrapperJson, webhookURL);
        Test.stopTest();
        System.assertEquals(esignWrapper!=Null, true);
        System.assertEquals(esignWrapper.size(), 1);
    }
}