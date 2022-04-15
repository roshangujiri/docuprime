public with sharing class ViewPDFController {

    public static final String BODY = 'Body';
    public static final String HEADER = 'Header';
    public static final String FOOTER = 'Footer';
    public static final String RELATED_RECORDS = 'Related Records';
    public static final String CUSTOM_CONTENT = 'Custom Content';
    public static final String ALL_THE_PAGES = 'All The Pages';
    public static final String FIRST_PAGE_ONLY = 'First Page Only';
    public static final String PAGE_BREAK = 'Page Break';
    public static final String BLANK_PAGE = 'Blank Page';
    public static final String DEFAULT_CSSFILE= 'DocumentCSS';
    public static final String DEFAULT_DOCTYPE= 'PDF';
    public static final String DEFAULT_PAGESIZE= 'A4';
    public static Corporate_Document__c corpDoc {get;set;}
    public static String allPageHeader {get;set;}
    public static String allPageFooter {get;set;}
    public static String firstPageHeader {get;set;}
    public static String firstPageFooter {get;set;}
    public static String headerAlignment {get;set;}
    public static String footerAlignment {get;set;}
    public static boolean isPageBreakLast {get;set;}
    public static String pagesize {get;set;}
    public static List<WrapperDocument> wrContentDocumentLst {get;set;}
    

    public static Id corpDocId = System.currentPagereference().getParameters().get('id');
    //ABDS:s:Pass Value from Custom setting
    public static String DocumentCSS { get; set; }
    public static App_Settings__c App_Setting= App_Settings__c.getOrgDefaults();
    public static string ViewAs= System.currentPagereference().getParameters().get('viewas');
    public static String DocType{ get; set; }
    public static String ContentType{ get; set; }
     
    public static void loadPageContents() {
        pagesize=DEFAULT_PAGESIZE;
        wrContentDocumentLst = new List<WrapperDocument>();
        DocumentCSS=DEFAULT_CSSFILE;
        ViewAs=string.Isblank(ViewAs)?DEFAULT_DOCTYPE:ViewAs;
        ContentType='';
        DocType=DEFAULT_DOCTYPE;
        
        if (string.isNotBlank(App_Setting.DocumentCSS__c ))
        {
            DocumentCSS=App_Setting.DocumentCSS__c;
        }
        
        
        if (ViewAs=='word')
        {   
            DocType=''; 
            ContentType='application/msword';
        }
        else if (ViewAs=='excel')
        {
            DocType='';
            ContentType='application/vnd.ms-excel';
        }
        loadPageBodyContents();
        firstPageHeader = loadPageMarginContents(HEADER, FIRST_PAGE_ONLY);
        if(String.isBlank(firstPageHeader)) {
            allPageHeader = loadPageMarginContents(HEADER, ALL_THE_PAGES);
        }
        firstPageFooter = loadPageMarginContents(FOOTER, FIRST_PAGE_ONLY);
        if(String.isBlank(firstPageFooter)) {
            allPageFooter = loadPageMarginContents(FOOTER, ALL_THE_PAGES);
        }
    }
    
    private static void loadPageBodyContents() {
        List<Corporate_Document__c> corpDocList = new List<Corporate_Document__c>();
        corpDocList = [SELECT Id, Name, Document_Template__c, Document_Stage__c,Document_Template__r.Page_Size__c,
                            (SELECT Id, Section_Content__c, Content_Type__c, Enable_Landscape_Layout__c
                            FROM CorpContents__r
                            WHERE (Content_Type__c = :BODY OR Content_Type__c = :RELATED_RECORDS 
                            OR Content_Type__c = :PAGE_BREAK OR Content_Type__c = :BLANK_PAGE
                            OR Content_Type__c = :CUSTOM_CONTENT)
                            ORDER BY Order_Sequence__c ASC
                            NULLS LAST)
                        FROM Corporate_Document__c
                        WHERE Id = :corpDocId WITH SECURITY_ENFORCED]; 
        if(!corpDocList.isEmpty()) {
            corpDoc = corpDocList[0];
            if (string.isNotBlank( corpDoc.Document_Template__r.Page_Size__c))
            {
                pagesize=corpDoc.Document_Template__r.Page_Size__c;
            }
        }
        Integer i=1;
        for(Document_Content__c obj : corpDoc.CorpContents__r) {
            WrapperDocument wrDocObj = new WrapperDocument();
            wrDocObj.contentId = obj.Id;
            wrDocObj.contentType = obj.Content_Type__c;
            wrDocObj.enableLandscape = obj.Enable_Landscape_Layout__c;
            wrDocObj.sectionContent = obj.Section_Content__c;
            wrDocObj.enablePageBeak = false;
            if(obj.Content_Type__c == 'Page Break') {
                wrDocObj.enablePageBeak = checkEnablePageBreak(obj.Id, corpDoc.CorpContents__r);
            }
            if(corpDoc.CorpContents__r.size() == i && obj.Content_Type__c == 'Blank Page'){
                wrDocObj.isLastBlankPage = true;
            } else{
                wrDocObj.isLastBlankPage = false;
            }
            i=i+1;
            wrContentDocumentLst.add(wrDocObj);
        }
    }

    private static Boolean checkEnablePageBreak(string contentId,List<Document_Content__c> documentContentLst) {
        boolean flag = false;
        for(Document_Content__c obj : documentContentLst) {
            if(flag && obj.Content_Type__c != 'Page Break') {
                return true;
            }
            if(obj.Id == contentId) {
                flag = true;
            }
        }
        return false;
    }

    private static String loadPageMarginContents(String marginDiv, String visibility) {
        String marginContent;
        List<Document_Content__c> sectionList = new List<Document_Content__c>();
        sectionList = [SELECT Id, Section_Content__c, Content_Type__c, Alignment__c
                        FROM Document_Content__c
                        WHERE Content_Type__c = :marginDiv
                        AND Visibility__c = :visibility
                        AND Corporate_Document__c = :corpDocId
                        WITH SECURITY_ENFORCED
                        ORDER BY Order_Sequence__c ASC
                        NULLS LAST]; 
        if(!sectionList.isEmpty()) {
            if(marginDiv == HEADER) {
                headerAlignment = sectionList[0].Alignment__c;
            } else if(marginDiv == FOOTER) {
                footerAlignment = sectionList[0].Alignment__c;
            }
            marginContent = sectionList[0].Section_Content__c;
            //marginContent = marginContent.replace('<p>','').replace('</p>','');
        }
        return marginContent;
    }

    public class WrapperDocument {
        public String contentType {get;set;}
        public String contentId {get;set;}
        public boolean enableLandscape {get;set;}
        public String sectionContent {get;set;}
        public boolean enablePageBeak {get;set;}
        public boolean isLastBlankPage {get;set;}
    }

}