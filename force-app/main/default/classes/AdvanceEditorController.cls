/**
** Author      :   Ceptes Software Pvt. Ltd
** Description :   This class is used for TinyMCE Editor VF Page.
**/


global with sharing class AdvanceEditorController {
    private final Document_Content__c sectionContent;
 
    global AdvanceEditorController() {
        Id sectionId;
        if(!Test.isRunningTest()) {
            sectionId = ApexPages.currentPage().getParameters().get('recordId');
        } else {
            // As we don't have apex page as part of package, and mock data created in test class
            sectionId = [SELECT Id FROM Document_Content__c WITH SECURITY_ENFORCED LIMIT 1].Id;
        }
        sectionContent = [SELECT Id, Name, Section_Content__c 
            FROM Document_Content__c 
            WHERE Id = :sectionId
            WITH SECURITY_ENFORCED];
    }
	
    /**
     * @description  :   Updates the document sections
     * @param        :   void
     * @return       :   Document_Content__c (section content)
     */
    global Document_Content__c getSectionContent() {
        return sectionContent;
    }

    /**
     * @description  :   Updates the document sections 
     * @param        :   void
     * @return       :   void
     */
    global PageReference save() {
        SObjectAccessDecision securityDecision = Security.stripInaccessible(
                                         AccessType.UPDATABLE, new List<Document_Content__c> {sectionContent});
        UPDATE securityDecision.getRecords();
        return Null;
    }
}