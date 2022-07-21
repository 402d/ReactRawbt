import {NativeModules} from 'react-native';

const {RNRawbtLibraryModule} = NativeModules;

/**
 * RawBT - the print driver for android on a thermal printer
 */
type RawBtApiType = {
    /**
     * Bind to service
     */
    init(): void;

    /**
     * Send print job to service
     * @param {string} gson - see RawBTPrintJob
     *
     * @example RawBtApi.printJob(job.GSON());
     */
    printJob(gson: string): Promise<boolean>;

    /**
     * Receive images bytes for job.image()
     *
     * @param uri images uri
     * @example Image.resolveAssetSource(require("./assets/bwlogo.webp")).uri;
     */
    getImageBase64String(uri: string): Promise<string>;
}

export default RNRawbtLibraryModule as RawBtApiType;

// ===========================================================================================
// ## Constants
// ==========================================================================================

// aligment
export const ALIGNMENT_LEFT = "left";
export const ALIGNMENT_RIGHT = "right";
export const ALIGNMENT_CENTER = "center";

// barcode
export const BARCODE_UPC_A = "upc_a";
export const BARCODE_UPC_E = "upc_e";
export const BARCODE_EAN13 = "ean13";
export const BARCODE_JAN13 = "jan13";
export const BARCODE_EAN8 = "ean8";
export const BARCODE_JAN8 = "jan8";
export const BARCODE_CODE39 = "code39";
export const BARCODE_ITF = "itf";
export const BARCODE_CODABAR = "codabar";
export const BARCODE_CODE93 = "code93";
export const BARCODE_CODE128 = "code128";
export const BARCODE_GS1_128 = "gs1_128";
export const BARCODE_GS1_DATABAR_OMNIDIRECTIONAL = "databar_omni";
export const BARCODE_GS1_DATABAR_TRUNCATED = "databar_trunc";
export const BARCODE_GS1_DATABAR_LIMITED = "databar_limit";
export const BARCODE_GS1_DATABAR_EXPANDED = "databar_expand";

// font
export const FONT_DEFAULT = 0;
export const FONT_A = 1;
export const FONT_B = 2;
export const FONT_C = 3;
export const FONT_TRUE_TYPE = 4;

// hri
export const HRI_NONE = "none";
export const HRI_ABOVE = "above";
export const HRI_BELOW = "below";
export const HRI_BOTH = "both";

// images
export const DITHERING_BW = 0;
export const DITHERING_SF = 1;
export const DITHERING_ATKINSON = 2;
export const DITHERING_BURKES = 3;
export const DITHERING_SIERA = 4;
export const DITHERING_SKETCH = 5;
export const DITHERING_BEST_CONTRAST = 6;
export const DITHERING_REGULAR = 7;
export const DITHERING_NONE_RESIZE_ONLY = 8;
export const DITHERING_127 = 9;


// ===========================================================================================
// ## Attributes
// ==========================================================================================

/**
 * Text format
 *
 * @param {string} alignment  ALIGNMENT_LEFT,ALIGNMENT_CENTER,ALIGNMENT_RIGHT
 * @param {boolean} bold
 * @param {boolean} doubleHeight
 * @param {boolean} doubleWidth
 *
 * @returns {AttributesString}
 */
export class AttributesString {
    // properties for GSON
    alignment: string = ALIGNMENT_LEFT;
    bold: boolean = false;
    doubleHeight: boolean = false;
    doubleWidth: boolean = false;
    fontsCpi: number = 0;
    internationalChars: number = 0;
    lang: string = "default";
    printerFont: number = 0;
    truetypeFontSize: number = 21;
    underline: boolean = false;
    // -----------------------

    constructor(
        alignment: string = ALIGNMENT_LEFT,
        bold: boolean = false,
        doubleHeight: boolean = false,
        doubleWidth: boolean = false
    ) {
        this.alignment = alignment;
        this.bold = bold;
        this.doubleHeight = doubleHeight;
        this.doubleWidth = doubleWidth;
    }

    setAlignment(alignment: string) {
        this.alignment = alignment;
        return this;
    }

    setBold(bold: boolean) {
        this.bold = bold;
        return this;
    }

    setDoubleHeight(h: boolean) {
        this.doubleHeight = h;
        return this;
    }

    setDoubleWidth(w: boolean) {
        this.doubleWidth = w;
        return this;
    }

    setPrinterFont(font: number) {
        this.printerFont = font;
        return this;
    }

    setTrueTypeFontSize(size: number) {
        this.truetypeFontSize = size;
        return this;
    }

    setUnderline(u: boolean) {
        this.underline = u;
        return this;
    }

    build() {
        let attr = new AttributesString(this.alignment,this.bold,this.doubleHeight,this.doubleWidth);
        attr.fontsCpi = this.fontsCpi;
        attr.internationalChars = this.internationalChars;
        attr.lang = this.lang;
        attr.printerFont = this.printerFont;
        attr.truetypeFontSize = this.truetypeFontSize;
        attr.underline = this.underline;
        return attr;
    }
}

/**
 *  AttributesImage
 */
export class AttributesImage {
    // properties for GSON
    alignment: string = ALIGNMENT_LEFT;
    doScale: boolean = true;
    graphicFilter: number = DITHERING_BW;
    inverseColor: boolean = false;
    rotateImage: boolean = false;
    scale: number = 16;
    // -----------------
    constructor(
        alignment: string = ALIGNMENT_LEFT,
        scale:number = 16
    ) {
        this.alignment = alignment;
        this.scale = scale;
    }

    setAlignment(a: string) {
        this.alignment = a;
        return this;
    }

    /**
     * Dithering
     * @param f - see constants DITHERING_xxx
     */
    setGraphicFilter(f: number) {
        this.graphicFilter = f;
        return this;
    }

    setInverseColor(inv: boolean) {
        this.inverseColor = inv;
        return this;
    }

    /**
     * 90 degree rotation
     * @param rotate
     */
    setRotateImage(rotate: boolean) {
        this.rotateImage = rotate;
        return this;
    }

    /**
     * Scale image from 6.25% to 100%
     * @param n - n/16 * 100%  1<=n<=16
     */
    setScale(n: number) {
        this.scale = n;
        return this;
    }

    setNotScale(){
        this.doScale = false;
        return this;
    }

    build(){
        let attributes = new AttributesImage();
        attributes.setAlignment(this.alignment);
        attributes.setGraphicFilter(this.graphicFilter);
        attributes.setInverseColor(this.inverseColor);
        attributes.setRotateImage(this.rotateImage);
        attributes.doScale = this.doScale;
        attributes.setScale(this.scale);
        return attributes;
    }
}

/**
 * AttributesBarcode
 */
export class AttributesBarcode {
    // properties for GSON
    type: string = BARCODE_EAN13;
    hri: string = HRI_NONE;
    font: number = FONT_A;
    height: number = 162;
    width: number = 3;
    alignment: string = ALIGNMENT_LEFT;
    // -----------------
    constructor(
        type: string = BARCODE_EAN13,
        alignment: string = ALIGNMENT_LEFT
    ) {
        this.type = type;
        this.alignment = alignment;
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    setAlignment(alignment: string) {
        this.alignment = alignment;
        return this;
    }

    setHri(hri: string) {
        this.hri = hri;
        return this;
    }

    setFont(font: number) {
        this.font = font;
        return this;
    }

    setHeight(h: number) {
        this.height = h;
        return this;
    }

    setWidth(w: number) {
        this.width = w;
        return this;
    }

    build() {
        let attr = new AttributesBarcode();
        attr.type = this.type;
        attr.hri = this.hri;
        attr.font = this.font;
        attr.height = this.height;
        attr.width = this.width;
        attr.alignment = this.alignment;
        return attr;
    }
}

/**
 * AttributesQRcode
 */
export class AttributesQRcode {
    // properties for GSON
    alignment: string = ALIGNMENT_CENTER;
    multiply: number = 3;
    // -----------------
    constructor(
         alignment: string = ALIGNMENT_CENTER,
         multiply: number = 3
    ) {
        this.alignment = alignment;
        this.multiply = multiply;
    }

    setAlignment(alignment: string){
        this.alignment = alignment;
        return this;
    }

    setMultiply(multiply:number){
        this.multiply = multiply;
        return this;
    }

    build() {
        return new AttributesQRcode(this.alignment,this.multiply);
    }
}

// *******************************************************************
// ## Command
// *******************************************************************

export interface Command {
    command: string; // required for GSON
}

/**
 * Barcode
 */
export class CommandBarcode implements Command {
    // properties for GSON
    command: string = "barcode";
    data: string;
    type: string;
    hri: string = HRI_NONE;
    font: number = FONT_A;
    height: number = 162;
    width: number = 3;
    alignment: string = ALIGNMENT_LEFT;
    // -----------------------
    constructor(type: string, data: string) {
        this.type = type;
        this.data = data;
    }

    setHri(hri: string) {
        this.hri = hri;
        return this;
    }

    setFont(font: number) {
        this.font = font;
        return this;
    }

    setHeight(h: number) {
        this.height = h;
        return this;
    }

    setWidth(w: number) {
        this.width = w;
        return this;
    }

    setAlignment(a: string) {
        this.alignment = a;
        return this;
    }
}

export class CommandCut implements Command{
    command: string = "cut";
}

/**
 * Draw line
 */
export class CommandDrawLine implements Command {
    // properties for GSON
    command: string;
    ch: string;
    attributesString: AttributesString;
    // -----------------
    constructor(ch: string, attr: AttributesString) {
        this.command = "line";
        this.ch = ch;
        this.attributesString = attr;
    }
}

/**
 * Image
 */
export class CommandImageInBase64 implements Command {
    command: string = "image";
    base64: string;
    attributesImage: AttributesImage;

    constructor(base64: string, attr: AttributesImage) {
        this.base64 = base64;
        this.attributesImage = attr;
    }
}

/**
 * Line with alignment to 2 bound of paper
 */
export class CommandLeftRightText implements Command {
    // properties for GSON
    command: string = "leftRightText";
    leftText: string;
    rightText: string;
    leftIndent: number = 0;
    rightIndent: Number = 0;
    leftAttr: AttributesString;
    rightAttr: AttributesString;
    // -----------------
    constructor(
        leftText: string,
        rightText: string,
        leftAttr: AttributesString,
        rightAttr: AttributesString
    ) {
        this.leftText = leftText;
        this.rightText = rightText;
        this.leftAttr = leftAttr;
        this.rightAttr = rightAttr;
    }

    setLeftIndent(i: number) {
        this.leftIndent = i;
        return this;
    }

    setRightIndent(i: number) {
        this.rightIndent = i;
        return this;
    }
}

/**
 * Lines feed
 */
export class CommandNewLine implements Command {
    // properties for GSON
    command: string;
    count: number;
    // -----------------

    constructor(count: number) {
        this.command = "ln";
        this.count = count;
    }
}

/**
 * QR
 */
export class CommandQRcode implements Command {
    // properties for GSON
    command: string;
    data: string;
    alignment: string;
    multiply: number;
    // -----------------

    constructor(data: string, attr: AttributesQRcode) {
        this.command = "qrcode";
        this.data = data;
        this.alignment = attr.alignment;
        this.multiply = attr.multiply;
    }
}

/**
 * It is main ! Print text
 */
export class CommandString implements Command {
    command: string;
    attributesString: AttributesString;
    text: string;

    constructor(text: string, attr: AttributesString) {
        this.command = "print";
        this.text = text;
        this.attributesString = attr;
    }
}

// *************************************************************
// ## print job
// *************************************************************
export interface iRawBTPrintJob {
    // properties for GSON
    commands: Command[];
    copies: number;
    printer: string;
    template: string;
}

export type RawBtProgress  = {
    progress: number; // percent
    message: string;
    /**
     * One from 'success','error','progress','info','canceled','connected'
     */
    status: string;
}

export class RawBTPrintJob implements iRawBTPrintJob {
    // properties for GSON
    copies: number = 1;
    printer: string = "current";
    template: string = "default";
    commands: Command[] = [];
    // -----------------------

    // not for GSON
    defaultAttrString: AttributesString;
    defaultAttrImage: AttributesImage;
    defaultAttrBarcode: AttributesBarcode;

    constructor(
        printer: string = "current",
        copies: number = 1,
        template: string = "default"
    ) {
        this.printer = printer;
        this.copies = copies;
        this.template = template;
    }

    // ----- getters & setters ------------
    setCopies(n:number){
        this.copies = n;
        return this;
    }
    setPrinter(printerId: string){
        this.printer = printerId;
        return this;
    }
    setTemplates(template: string){
        this.template = template;
        return this;
    }

    getDefaultAttrString() {
        if (this.defaultAttrString === undefined) {
            return new AttributesString();
        }
        return this.defaultAttrString;
    }

    getDefaultAttrImage() {
        if (this.defaultAttrImage === undefined) {
            return new AttributesImage();
        }
        return this.defaultAttrImage;
    }

    getDefaultAttrBarcode() {
        if (this.defaultAttrBarcode === undefined) {
            return new AttributesBarcode();
        }
        return this.defaultAttrBarcode;
    }

    setDefaultAttrString(attr: AttributesString){
        this.defaultAttrString = attr;
        return this;
    }

    setDefaultAttrImage(attr: AttributesImage){
        this.defaultAttrImage = attr;
        return this;
    }

    setDefaultAttrBarcode(attr: AttributesBarcode){
        this.defaultAttrBarcode = attr;
        return this;
    }
    // ---------------------------------------------------

    add(command: Command) {
        this.commands.push(command);
        return this;
    }

    // --------- command ---------

    barcode(data: string, attr?: AttributesBarcode) {

        attr = attr ?? this.getDefaultAttrBarcode();

        let command = new CommandBarcode(attr.type, data)
            .setAlignment(attr.alignment)
            .setHri(attr.hri)
            .setFont(attr.font)
            .setHeight(attr.height)
            .setWidth(attr.width);

        this.commands.push(command);
        return this;
    }

    cut() {
        this.commands.push(new CommandCut());
        return this;
    }

    drawLine(ch: string, attr?: AttributesString) {
        attr = attr ?? this.getDefaultAttrString();
        this.commands.push(new CommandDrawLine(ch, attr));
        return this;
    }

    image(base64: string, attr?: AttributesImage) {
        attr = attr ?? this.getDefaultAttrImage();
        this.commands.push(new CommandImageInBase64(base64, attr));
        return this;
    }

    println(text: string, attr?: AttributesString) {
        attr = attr ?? this.getDefaultAttrString();
        this.commands.push(new CommandString(text, attr));
        return this;
    }

    qrcode(value: string, attr:AttributesQRcode){
        attr = attr ?? new AttributesQRcode();
        this.commands.push(new CommandQRcode(value,attr));
        return this;
    }

    ln(count: number = 1) {
        this.commands.push(new CommandNewLine(count));
        return this;
    }



    leftRightText(leftText: string, rightText: string) {
        let attr = this.getDefaultAttrString();
        let command = new CommandLeftRightText(leftText, rightText, attr, attr);
        this.commands.push(command);
        return this;
    }

    leftRightTextWithFormat(
        leftText: string,
        rightText: string,
        attr: AttributesString
    ) {
        let command = new CommandLeftRightText(leftText, rightText, attr, attr);
        this.commands.push(command);
        return this;
    }

    leftRightTextWithBothFormat(
        leftText: string,
        rightText: string,
        attrLeft: AttributesString,
        attrRight: AttributesString
    ) {
        let command = new CommandLeftRightText(
            leftText,
            rightText,
            attrLeft,
            attrRight
        );
        this.commands.push(command);
        return this;
    }

    leftIndentRightText(indent: number, leftText: string, rightText: string) {
        let attr = this.getDefaultAttrString();
        let command = new CommandLeftRightText(leftText, rightText, attr, attr);
        command.setLeftIndent(indent);
        this.commands.push(command);
        return this;
    }

    leftRightIndentText(indent: number, leftText: string, rightText: string) {
        let attr = this.getDefaultAttrString();
        let command = new CommandLeftRightText(leftText, rightText, attr, attr);
        command.setRightIndent(indent);
        this.commands.push(command);
        return this;
    }

    // --------------------------------------------
    _gsonReplacer(key, value) {
        if (key == "defaultAttrString") return;
        else if (key == "defaultAttrImage") return;
        else if (key == "defaultAttrBarcode") return;
        else return value;
    }

    GSON() {
        return JSON.stringify(this, this._gsonReplacer);
    }
}

