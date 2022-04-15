public with sharing class TemplateIdentifierClass {
    public TemplateIdentifierClass() {

    }

    @AuraEnabled( cacheable=true )  
    public static String fetchMetadataIdentifierRecs() {
        App_Settings__c rec = App_Settings__c.getInstance();
        if (rec.Start_Identifier__c == null) {
            rec.Start_Identifier__c = '[';
        }
        if (rec.End_Identifier__c == null) {
            rec.End_Identifier__c = ']';
        } {
        
        }
        return JSON.serialize(rec);
    }
    
    @AuraEnabled( cacheable=true )  
    public static String fetchDateFormats() {
		Date_Format__mdt dateFormatRec;
       // Date_Format__mdt dateFormatRec = [SELECT Id, Date_Format__c, MasterLabel FROM Date_Format__mdt limit 1];
        if((Schema.sObjectType.Date_Format__mdt.fields.Id.isAccessible()) && (Schema.sObjectType.Date_Format__mdt.fields.Date_Format__c.isAccessible()) && (Schema.sObjectType.Date_Format__mdt.fields.MasterLabel.isAccessible())){
           dateFormatRec  = [SELECT Id, Date_Format__c, MasterLabel FROM Date_Format__mdt limit 1];
        }
        //Date_Format__mdt dateFormatRec = [SELECT Id, Date_Format__c, MasterLabel FROM Date_Format__mdt limit 1];
        return JSON.serialize(dateFormatRec);
    }
    
    @AuraEnabled( cacheable=true )  
    public static String convertDate(String dateValue, String dateFormat, String fieldValueChange) {
        Date dateNew;
		system.debug('ms: dateValue = '+dateValue);
        if (fieldValueChange == 'yes') {
            Map<String, Integer> mapOfMonThToInteger = new Map<String, Integer>(); 
            mapOfMonThToInteger.put('January', 1);
            mapOfMonThToInteger.put('February', 2);
            mapOfMonThToInteger.put('March', 3);
            mapOfMonThToInteger.put('April', 4);
            mapOfMonThToInteger.put('May', 5);
            mapOfMonThToInteger.put('June', 6);
            mapOfMonThToInteger.put('July', 7);
            mapOfMonThToInteger.put('August', 8);
            mapOfMonThToInteger.put('September', 9);
            mapOfMonThToInteger.put('October', 10);
            mapOfMonThToInteger.put('November', 11);
            mapOfMonThToInteger.put('December', 12);
            List<String> listDateDetail = dateValue.split(' ');
            String regex = '[a-zA-Z]{1,}[,]|\\-';
            String dayDetail = listDateDetail[1].replaceAll(regex, '');
            String dateString = listDateDetail[2]+'-'+mapOfMonThToInteger.get(listDateDetail[0])+'-'+dayDetail;
            dateNew = date.valueOf(dateString);
            
        } else {
            dateNew = date.valueOf(dateValue);
        }
        //Date dateNew = date.valueOf(dateValue);
        DateTime dtime = DateTime.newInstance(dateNew.year(), dateNew.month(),dateNew.day());
        String dateStr = dtime.format(dateFormat);
        return dateStr;
    }
}