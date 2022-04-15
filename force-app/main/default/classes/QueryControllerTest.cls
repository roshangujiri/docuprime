@isTest
private class QueryControllerTest {
	@isTest
     static void testGetRecordList() {
        List<Account> accList = TestDataFactory.createAccounts(1, 'TestAccount', true);
        List<Contact> conList = TestDataFactory.createContactsWithAccount(1, 'TestContact', accList[0].Id, true);
        String queryJSON = '{ "fields": "Name, Title", "objectName" : "Contact", "parentFieldApiName" : "AccountId",'+
            ' "filter": "Title != Null", "orderByField" : "Name", "orderBy" : "ASC", "recordLimit" : "5" }';
        List<Contact> newConList = (List<Contact>) QueryController.getRecordList(accList[0].Id, queryJSON);
        System.assertEquals(1, newConList.size());
        System.assertEquals('TestContact0', newConList.get(0).Name);
    }
    
    @isTest
     static void testGetRecordList2() {
        List<Account> accList = TestDataFactory.createAccounts(2, 'TestAccount', true);
        Set<Id> accIdSet = new Set<Id>();
        for(Account ac : accList){
            accIdSet.add(ac.Id);
        }
        List<Contact> conList = TestDataFactory.createContactsWithAccount(1, 'TestContact', accList[0].Id, true);
		//String queryJSON = '{ "fields": "Name, Title", "objectName" : "Contact", "parentFieldApiName" : "AccountId",'+
            //' "filter": "Title != Null", "orderByField" : "Name", "orderBy" : "ASC", "recordLimit" : "5" }';
		String queryJSON = String.escapeSingleQuotes('{ "fields": "Name, Title", "objectName" : "Contact", "parentFieldApiName" : "AccountId",'+
            ' "filter": "Title != Null", "orderByField" : "Name", "orderBy" : "ASC", "recordLimit" : "5" }');
        
        List<Contact> newConList = (List<Contact>) QueryController.getRecordList(accIdSet, queryJSON);
        System.assertEquals(1, newConList.size());
        System.assertEquals('TestContact0', newConList.get(0).Name);
    }
    
    @isTest
     static void testGetFieldLabelList() {
        List<Domain.FieldNamesWrapper> fieldNamesWrapperList = QueryController.getFieldLabelList('Contact', 'Name, Email');
        System.assertEquals(2, fieldNamesWrapperList.size());
        System.assertEquals('Full Name', fieldNamesWrapperList.get(0).label);
        System.assertEquals('Email', fieldNamesWrapperList.get(1).label);
    }
}