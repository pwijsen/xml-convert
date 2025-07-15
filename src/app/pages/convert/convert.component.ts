import { Component, OnInit } from '@angular/core';
import { setThrowInvalidWriteToSignalError } from '@angular/core/primitives/signals';
import { FormsModule } from '@angular/forms';
import { RouterTestingHarness } from '@angular/router/testing';
import { every } from 'rxjs';


@Component({
  selector: 'app-convert',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './convert.component.html',
  styleUrl: './convert.component.css'
})
export class ConvertComponent implements OnInit {

  constructor() { }

  xmlData: string = "";
  target: any = "";
  isBkToCstmrStmt: boolean = false;

  c: number = 0;

  ngOnInit() {
    console.log("Init  ConvertComponent");
  }



  convert() {
    this.c = 0;
    console.log("ConvertToXML Clicked");

    const parser = new DOMParser();
    const xml: Document = parser.parseFromString(this.xmlData, 'text/xml');

    this.target = "";
    xml.childNodes.forEach(element => { //First level childnodes from the root Document
      this.readChildren(element);
    })

  }

  

  lineCount: number = 0;

  private readChildren(node: ChildNode) { //Recursive call

    node.childNodes.forEach(element => {

      if (element.nodeName == "BkToCstmrStmt") {
        this.isBkToCstmrStmt = true;
      }

      if (this.isBkToCstmrStmt && element.nodeName == "Ntry") {

        this.lineCount = this.lineCount + 1;
        console.log("Into Entry " + this.lineCount);
        
        let refNode: ChildNode | null|undefined = this.getChildNodeByName(element, "NtryRef");
        let strReference: string | null | undefined = refNode?.childNodes.item(0).nodeValue;
        console.log("REF:" + strReference);
        let strAmount: string | null | undefined = this.getChildNodeByName(element, "Amt")?.childNodes.item(0).nodeValue;
        console.log("AMOUNT:" + strAmount);
        let strCreditOrDebet: string | null | undefined = this.getChildNodeByName(element, "CdtDbtInd")?.childNodes.item(0).nodeValue;
        console.log("CREDITorDEBET:" + strCreditOrDebet);

        let strDescr: string | null | undefined = this.getChildNodeByName(element, "Ustrd")?.childNodes.item(0).nodeValue;
        if (strDescr == null) strDescr = this.getChildNodeByName(element, "AcctSvcrRef")?.childNodes.item(0).nodeValue;
        if (strDescr != null) strDescr = strDescr!.replaceAll(",", ".");

        console.log("Reading done ... updating TARGET line");

        this.target = this.target + "\n"
          + this.lineCount + ","
          + strReference + ","
          + strAmount + ","
          + strCreditOrDebet + ","
          + strDescr;

      } else {
        console.log("Not an Ntry, calling recursive children")
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

  
  test() {
    console.log("START TEST");
    const parser = new DOMParser();
    const xml: Document = parser.parseFromString(this.xmlData, 'text/xml');
    let parent:ChildNode|null=xml.firstChild;
    let result:ChildNode|null|undefined= this.getChildNodeByName(parent,"ToDtTm");
    console.log("TEST END : "+result?.nodeName);
    this.target=result?.nodeName+" found."; //just put the name in the textfield
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


