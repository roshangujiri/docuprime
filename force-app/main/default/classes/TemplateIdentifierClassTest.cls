@isTest
private class TemplateIdentifierClassTest {
    @isTest
     static void fetchSampleRecsTest() {
        TemplateIdentifierClass templateIdentifierClassInst = new TemplateIdentifierClass();
        TemplateIdentifierClass.fetchMetadataIdentifierRecs();
        TemplateIdentifierClass.fetchDateFormats();
        String convertDate = TemplateIdentifierClass.convertDate('January 1 2021', 'MM/dd/yyyy','yes');
		System.assert(!String.isEmpty(convertDate));

    }
}