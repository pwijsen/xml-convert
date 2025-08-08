import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Attribute } from '../../models/attribute.model';
import { CommonModule } from '@angular/common'; // Import CommonModule



@Component({
  selector: 'app-convert',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './convert.component.html',
  styleUrl: './convert.component.css'
})
export class ConvertComponent implements OnInit {

  constructor() { }

  xmlData: string = "";
  target: any = "";
  attributes:Attribute[]=[];
  isBkToCstmrStmt: boolean = false;
  isCompoundXML: boolean = false;
  
  c: number = 0;
  parser:DOMParser=new DOMParser;

  ngOnInit() {
    console.log("Init  ConvertComponent");
  }

  parseXML():Document {
    let stringToParse:string=this.xmlData.replaceAll(String.fromCharCode(160)," ");
    stringToParse=stringToParse.replaceAll("=Ü","=\"U");
    stringToParse=stringToParse.replaceAll("=ÿ","=\"y");
    stringToParse=stringToParse.replaceAll("=Ë","=\"E");
    stringToParse=stringToParse.replaceAll("=Ï","=\"I");
    stringToParse=stringToParse.replaceAll("\"encoding","\" encoding");
    stringToParse=stringToParse.replaceAll("\"standalone","\" standalone");
    console.log("XML String To Parse :"+stringToParse);
    var xmlDoc:Document = this.parser.parseFromString(stringToParse,"application/xml");
    // console.log("ParseXML : "+xmlDoc.documentElement.nodeName
    // +" first node="+xmlDoc.firstChild?.nodeName
    // +" deeper node="+xmlDoc.firstChild?.firstChild?.nodeName
    // );
    if(xmlDoc.documentElement.nodeName == "html" || xmlDoc.firstChild?.firstChild?.nodeName=="parsererror") throw new Error("INPUT IS NOT XML");
    
    return xmlDoc;
  }

  lastConvertedXML:string="";
  convert() {
    console.log("INTO Convert");

    if(this.xmlData.trim()==this.lastConvertedXML){
      console.log("No TXT change, doing nothing");
      return;
    }

    //There is somethign that is not exact the previous input.
    this.lastConvertedXML=this.xmlData;
    this.attributes=[];
    this.target="";
    let xml:Document;

    try{
      xml = this.parseXML();
    }catch(error){
      console.log("Can not parse string to XML.");
      return;
    }
   


    
    this.count = 0;
    this.isBkToCstmrStmt = false;
    this.isCompoundXML = false;

    xml.childNodes.forEach(element => { //First level childnodes from the root Document
      
      this.readChildren(element);
    })

    console.log("XML Reading finished. Attributes qty:"+this.attributes.length);


    
  }

  lineCount: number = 0;
  count:number=1;

  private readChildren(node: ChildNode) { //Recursive call
    console.log((this.count++)+". INTO ReadChildren nodeName:"+node.nodeName+" type:"+node.nodeType+" value:"+node.nodeValue)
    
    node.childNodes.forEach(element => {
      
      if (element.nodeName == "BkToCstmrStmt") {
        this.isBkToCstmrStmt = true;
      }

      if (element.nodeName == "attributes") {
        this.isCompoundXML = true;
      }

      if(this.isCompoundXML && element.nodeName == "attribute"){
        this.lineCount++;
        let att:Attribute=new Attribute();
        att.name=(<Element>element).getAttribute("name");
        att.value=element.firstChild?.nodeValue;
        this.attributes.push(att);

      }else if (this.isBkToCstmrStmt && element.nodeName == "Ntry") {

        this.lineCount = this.lineCount + 1;
        console.log("Into Entry " + this.lineCount);
        
        let refNode: ChildNode | null|undefined = this.getChildNodeByName(element, "NtryRef");
        let strReference: string | null | undefined = refNode?.childNodes.item(0).nodeValue;
        
        let strAmount: string | null | undefined = this.getChildNodeByName(element, "Amt")?.childNodes.item(0).nodeValue;
        
        let strCreditOrDebet: string | null | undefined = this.getChildNodeByName(element, "CdtDbtInd")?.childNodes.item(0).nodeValue;
        

        let strDescr: string | null | undefined = this.getChildNodeByName(element, "Ustrd")?.childNodes.item(0).nodeValue;
        if (strDescr == null) strDescr = this.getChildNodeByName(element, "AcctSvcrRef")?.childNodes.item(0).nodeValue;
        if (strDescr != null) strDescr = strDescr!.replaceAll(",", ".");

        let Dt: ChildNode | null|undefined = this.getChildNodeByName(element, "Dt");
        let strDt: string | null | undefined = Dt?.childNodes.item(0).nodeValue;
       

        this.target = this.target + "\n"
          + this.lineCount + ","
          + strDt + ","
          + strReference + ","
          + strAmount + ","
          + strCreditOrDebet + ","
          + strDescr;

      } else {
        //console.log("No implemented node for type '"+element.nodeName+"', calling recursive children")
        this.readChildren(element);
      }

      this.c = this.c + 1;

    });

    

  }

  save() {
    console.log("Into Save :");
    console.log(this.xmlData);
    //Read the XMl structure

  }


  printAsciiChars(s:string){
    for (let i:number=0; i < s.length; i++){
      console.log(s.charCodeAt (i)+" "+s.charAt(i));
    }
  }

  test() {
    console.log("START TEST");
    this.printAsciiChars(this.xmlData);
    this.xmlData=this.xmlData.replaceAll(String.fromCharCode(160)," ");
    console.log("\nAFTER REPLACE\n");
    this.printAsciiChars(this.xmlData);
  }

  nodeToSearchFor:ChildNode|undefined=undefined;

  getChildNodeByName(aNode: ChildNode|null|undefined, name: string): ChildNode|undefined|null {
    this.nodeToSearchFor=undefined;
    this.searchFirstChildNodeByNameDeep(aNode,name);
    return this.nodeToSearchFor;
  }

  private searchFirstChildNodeByNameDeep(aNode: ChildNode|undefined|null, name: string){
    
    if(this.nodeToSearchFor!=undefined) return; //defined means it's found, so roll-up
    
    const list = aNode?.childNodes;
    list?.forEach((node:ChildNode) => {
        if (node?.nodeName == name) {
          this.nodeToSearchFor=node;
        }else{
          this.searchFirstChildNodeByNameDeep(node, name);
        }
       }
     );    
  }

}


