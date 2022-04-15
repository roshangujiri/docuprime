global  class CarboneRequestGenerator implements lwapic.IICRequestGenerator {
   global String generateRequest(lwapic.ICChannelRequest icChannelRequest) {
        System.debug('-=- icChannelRequest -=- '+icChannelRequest);
      	System.debug('ICGateway.requestBody = '+ICGateway.requestBody);
        return ICGateway.requestBody;
    }
}