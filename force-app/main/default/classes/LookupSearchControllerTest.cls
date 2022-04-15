@isTest
private class LookupSearchControllerTest {
    
    @isTest
     static void testFindRecords() {
        LookupSearchController.findRecords('Acc', 'NonSetupObjects');
        LookupSearchController.findRecords('Opp', 'Opportunity-getChild');
        LookupSearchController.findRecords('Name', 'Account');
        LookupSearchController.getResults('Account','No Search' , null);
        List<String> selectedRecId = new List<String>();
        selectedRecId.add('Name');
		List<Object> result = LookupSearchController.getResults('Account','No Search' , selectedRecId);
       	//List<String> selectedRecId = LookupSearchController.getResults('Account','No Search' , selectedRecId);
			//system.debug('result:'+result);
		System.assert(!result.isEmpty());
    }
    
}