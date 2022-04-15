@isTest
global class WebhookCalloutHttpCalloutMockGenegrator implements HttpCalloutMock {
    // Implement this interface method
    global HTTPResponse respond(HTTPRequest request) {
        // Create a fake response
        HttpResponse response = new HttpResponse();
        response.setHeader('Content-Type', 'application/json');
        response.setBody('[{"contentVersionId":"0682x000002wEouAAE","approverName":"Tom Ripley","approverEmail":"test@gmail.com"}]}');
        response.setStatusCode(200);
        return response; 
    }
}