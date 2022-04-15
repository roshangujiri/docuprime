@isTest
private class AdvanceEditorControllerTest {
    @isTest
    public static void testAdvanceEditorControllerSave() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Document_Content__c> sectionList = TestDataFactory.createSections(2, 'Section', templateList[0].Id, false);
            FormHandler.upsertDocContentList(sectionList);
            AdvanceEditorController objAdvanceEditorController = new AdvanceEditorController();
            objAdvanceEditorController.getSectionContent();
            objAdvanceEditorController.save();
            List<Document_Content__c> newSectionList = new List<Document_Content__c>();
            newSectionList = [SELECT Id, Name FROM Document_Content__c];
            System.assertEquals(2, newSectionList.size(), 'count matched');
        }
    }

}