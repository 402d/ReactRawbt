import {useEffect} from "react";
import {StatusBar} from "expo-status-bar";
import {
    NativeEventEmitter,
    NativeModules,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Button,
    Image,
    Text,
    View,
    Alert
} from "react-native";

// -------------------------------------------
// RawBT API
// -------------------------------------------
import RawbtApi,
{
    RawBTPrintJob,
    AttributesString,
    AttributesBarcode,
    AttributesQRcode,
    AttributesImage,
    CommandBarcode,
    FONT_A,
    FONT_B,
    FONT_TRUE_TYPE,
    ALIGNMENT_LEFT,
    ALIGNMENT_CENTER,
    ALIGNMENT_RIGHT,
    HRI_ABOVE,
    HRI_BELOW,
    HRI_BOTH,
    BARCODE_UPC_A,
    BARCODE_UPC_E,
    BARCODE_EAN13,
    BARCODE_JAN13,
    BARCODE_EAN8,
    BARCODE_JAN8,
    BARCODE_CODE39,
    BARCODE_ITF,
    BARCODE_CODABAR,
    BARCODE_CODE93,
    BARCODE_CODE128,
    BARCODE_GS1_128,
    BARCODE_GS1_DATABAR_OMNIDIRECTIONAL,
    BARCODE_GS1_DATABAR_TRUNCATED,
    BARCODE_GS1_DATABAR_LIMITED,
    BARCODE_GS1_DATABAR_EXPANDED,
} from 'react-native-rawbt-api';
import PrinterProgress from "react-native-rawbt-api/print_progres";



const {ReactNativeLoading} = NativeModules;

// --------------------------------
// RawBT events listener
// --------------------------------
let subscription;
if (subscription === undefined) {
    const loadingManagerEmitter = new NativeEventEmitter(ReactNativeLoading);
    subscription = loadingManagerEmitter.addListener("RawBT", ({status,progress,message}) => {
        console.log(status+" "+progress+" "+message);
        // your code if it needs more <PrinterProgress />
    });
}

const showError = (error:string) => {
    Alert.alert('Print error',error,[
        {
            text: 'Cancel',
            style: 'cancel',
        },
    ]);
}

// -------------------------
// First demo
// --------------------------
const printHello = async () => {
    let job = new RawBTPrintJob();

    job.println("Hello,World!");

    RawbtApi.printJob(job.GSON()).catch((err) => showError(err.message));
};

/**
 * Rich format options
 * @returns {Promise<void>}
 */
const demoRichFormat = async () => {
    let job = new RawBTPrintJob();

    // attr for title
    let attrStrTitle = new AttributesString()
        .setPrinterFont(FONT_A)
        .setAlignment(ALIGNMENT_CENTER)
        .setDoubleHeight(true)
        .setDoubleWidth(true);

    job.println("Rich Format", attrStrTitle);
    job.drawLine("*", attrStrTitle);

    job.println("drawLine(char) - print full line of char");
    job.drawLine("-");
    job.drawLine("=");
    job.drawLine(".");
    job.ln(2);

    job.println("leftRightText() ");
    job.drawLine("-");

    job.leftRightText("left part", "right part");

    job.leftIndentRightText(6, "left indent 6", "right part");
    job.leftRightIndentText(4, "left part", "right indent 4");
    job.drawLine("=");

    job.leftRightTextWithFormat("Total", "100.00", attrStrTitle);
    job.leftRightText("Long text as left part", "compare 58/80 mm");

    let attrStr = new AttributesString();
    job.leftRightTextWithBothFormat(
        "width",
        "Height",
        attrStr.setDoubleWidth(true),
        attrStr.setDoubleHeight(true)
    );

    RawbtApi.printJob(job.GSON()).catch((err) => showError(err.message));
};

/**
 * Example receipt
 */
class ReceiptItem {
    name : string;
    price: string;
    constructor(name:string,price:string) {
        this.name = name;
        this.price = price;
    }
}

const demoReceipt = async () => {
    try {
        let job = new RawBTPrintJob();

        const items: ReceiptItem[] = [
            {name: 'Example item #1', price: '4.00'},
            {name: 'Another thing', price: '3.50'},
            {name: 'Something else', price: '1.00'},
            {name: 'A final item', price: '4.45'},
        ];
        const subtotal = new ReceiptItem('Subtotal', '12.95');
        const tax = new ReceiptItem('A local tax', '1.30')
        const total = new ReceiptItem('Total', '14.25');
        const date = "Monday 6th of April 2015 02:56:25 PM";


        const attrBold = new AttributesString().setBold(true);
        const attrCenter = new AttributesString(ALIGNMENT_CENTER);
        const attrBig = new AttributesString(ALIGNMENT_CENTER, false, false, true);

        /* image */
        let imageUri = Image.resolveAssetSource(require("./assets/bwlogo.webp")).uri;
        let base64String = await RawbtApi.getImageBase64String(imageUri);
        job.image(base64String, new AttributesImage(ALIGNMENT_CENTER, 8));

        /* header */
        job.println("ExampleMart Ltd", attrBig);
        job.println("Shop No. 42", attrCenter);
        job.ln();
        job.println("SALES INVOICE", new AttributesString(ALIGNMENT_CENTER, true));
        job.ln();

        /* items */
        items.forEach((item) => job.leftRightText(item.name, item.price));

        /* subtotal & total */
        job.drawLine('-');
        job.leftRightTextWithFormat(subtotal.name, subtotal.price, attrBold);
        job.ln();
        job.leftRightText(tax.name, tax.price);
        job.leftRightTextWithFormat(total.name, total.price, attrBig);
        job.ln(2);

        /* footer */
        job.println("Thank you for shopping", attrCenter);
        job.println("at ExampleMart", attrCenter);
        job.println("For trading hours,", attrCenter);
        job.println("please visit example.com", attrCenter);
        job.ln(2);
        job.println(date);


        /* QR */
        job.qrcode("https://github.com/402d/ReactRawbt", new AttributesQRcode(ALIGNMENT_CENTER, 5));
        job.ln();

        /* Barcode */
        job.barcode("ABC", new AttributesBarcode(BARCODE_CODE39, ALIGNMENT_CENTER).setHri(HRI_BELOW));
        job.ln();

        /* Cut paper */
        job.ln(4); // feed paper for cut position (if need)
        job.cut();

        RawbtApi.printJob(job.GSON()).catch((err) => showError(err.message));
    }catch(err){
        // images error
        showError(err.message);
    }
}

// -------------------------
//  Fonts demo
// -------------------------

const demoFonts = async () => {
    let job = new RawBTPrintJob();

    // default values

    let attrStr = new AttributesString(ALIGNMENT_LEFT);
    attrStr.printerFont = FONT_A;

    job.defaultAttrString = attrStr;

    let attrStrTitle = new AttributesString(
        ALIGNMENT_CENTER,
        undefined,
        true,
        undefined
    );

    job.println("Important", attrStrTitle);

    job.println(
        "If a document requires several styles, then specify them explicitly for each purpose."
    );
    job.println(
        "Since the arguments are passed by reference, do not change the values of the arguments along the way."
    );
    job.ln();

    job.println("Font sizes", attrStrTitle);

    let fAw1h1 = new AttributesString();
    let fAw1h2 = new AttributesString(undefined, undefined, true, false);
    let fAw2h1 = new AttributesString(undefined, undefined, false, true);
    let fAw2h2 = new AttributesString(undefined, undefined, true, true);

    let fBw1h1 = new AttributesString().setPrinterFont(FONT_B);
    let fBw1h2 = new AttributesString()
        .setPrinterFont(FONT_B)
        .setDoubleHeight(true);
    let fBw2h1 = new AttributesString()
        .setPrinterFont(FONT_B)
        .setDoubleWidth(true);
    let fBw2h2 = new AttributesString()
        .setPrinterFont(FONT_B)
        .setDoubleHeight(true)
        .setDoubleWidth(true);

    job.println("Normal Font A", fAw1h1);
    job.println("Double height", fAw1h2);
    job.println("Double width", fAw2h1);
    job.println("width & height", fAw2h2);
    job.ln();

    job.println("Normal Font B", fBw1h1);
    job.println("Double height", fBw1h2);
    job.println("Double width", fBw2h1);
    job.println("width & height", fBw2h2);
    job.ln(3);

    job.println("True Type", attrStrTitle);

    let attrTrueType = new AttributesString().setPrinterFont(FONT_TRUE_TYPE);
    job.println(
        "If the printer does not support the required language, then text printing is available by creating a picture with text displayed in a truetype font.",
        attrTrueType
    );
    job.println(
        "à, è, ì, ò, ù, À, È, Ì, Ò, Ù, á, é, í, ó, ú, ý, Á, É, Í, Ó, Ú, Ý, â, ê, î, ô, û, ð, Â, Ê, Î, Ô, Û, Ð, ã, ñ, õ, Ã, Ñ, Õ, ä, ë, ï, ö, ü, ÿ, Ä, Ë, Ï, Ö, Ü, Ÿ, å, Å, æ, œ, Æ, Œ or ß, ç, Ç, ¿ , ¡",
        attrTrueType
    );
    job.ln(2);

    job.println("Alignment", attrStrTitle);
    let left = new AttributesString().setAlignment(ALIGNMENT_LEFT);
    let right = new AttributesString().setAlignment(ALIGNMENT_RIGHT);
    let center = new AttributesString().setAlignment(ALIGNMENT_CENTER);

    job.println("left", left);
    job.println("center", center);
    job.println("right", right);
    job.ln(2);

    job.println("Decoration", attrStrTitle);
    let bold = new AttributesString().setBold(true);
    let underline = new AttributesString().setUnderline(true);
    let underlineBold = new AttributesString().setUnderline(true).setBold(true);
    job.println("Normal text");
    job.println("Bold text.", bold);
    job.println("Underline text", underline);
    job.println("Underline bold", underlineBold);
    job.ln(2);

    job.println("Notice", bold);
    job.println(
        "Using different styles on the same line is not supported. See rich format."
    );
    job.ln();

    RawbtApi.printJob(job.GSON()).catch((err) => showError(err.message));
};

// ------------------------------------------
// DEMO BarCode
// -------------------------------------------

const demoBarcode = async () => {
    let job = new RawBTPrintJob();

    // attr for title
    let attrStrTitle = new AttributesString(ALIGNMENT_CENTER, false, true);

    job.println("Barcode", attrStrTitle);
    job.println("HRI & Alignment");
    job.ln();

    job.println("Center / HRI none");
    job.add(
        new CommandBarcode(BARCODE_UPC_A, "012345678905")
            .setHeight(64)
            .setAlignment(ALIGNMENT_CENTER)
    );
    job.ln();

    job.println("Left / HRI above");
    job.add(
        new CommandBarcode(BARCODE_UPC_A, "012345678905")
            .setHeight(64)
            .setHri(HRI_ABOVE)
            .setAlignment(ALIGNMENT_LEFT)
    );
    job.ln();

    job.println("Right / HRI bellow");
    job.add(
        new CommandBarcode(BARCODE_UPC_A, "012345678905")
            .setHeight(64)
            .setHri(HRI_BELOW)
            .setAlignment(ALIGNMENT_RIGHT)
    );
    job.ln();

    job.println("Height", new AttributesString().setBold(true));
    job.ln();

    job.println("Default look");
    job.add(new CommandBarcode(BARCODE_UPC_E, "0123456").setHri(HRI_BOTH));
    job.ln();

    job.println("Minimum. 12 dots");
    job.add(
        new CommandBarcode(BARCODE_UPC_E, "0123456").setHeight(12).setHri(HRI_BOTH)
    );
    job.ln();

    job.println("Safe max. 192 dots");
    job.add(
        new CommandBarcode(BARCODE_UPC_E, "01234565")
            .setHeight(192)
            .setHri(HRI_BOTH)
    );
    job.ln();

    job.println("Width", new AttributesString().setBold(true));
    job.ln();
    job.println("Default look");
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(32)
            .setHri(HRI_BOTH)
    );
    job.println("1-4 for 58mm");
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(32)
            .setWidth(1)
            .setHri(HRI_BOTH)
    );
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(32)
            .setWidth(2)
            .setHri(HRI_BOTH)
    );
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(32)
            .setWidth(3)
            .setHri(HRI_BOTH)
    );
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(32)
            .setWidth(4)
            .setHri(HRI_BOTH)
    );
    job.println("5-6 for 80mm or for 300 dpi");
    job.println("5)");
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(64)
            .setWidth(5)
            .setHri(HRI_BOTH)
    );
    job.println("6)");
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(64)
            .setWidth(6)
            .setHri(HRI_BOTH)
    );
    job.println("Reduces the width when overflow");
    job.println("7)");
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(96)
            .setWidth(7)
            .setHri(HRI_BOTH)
    );
    job.println("8)");
    job.add(
        new CommandBarcode(BARCODE_EAN13, "012345678901")
            .setHeight(96)
            .setWidth(8)
            .setHri(HRI_BOTH)
    );
    job.ln(2);

    RawbtApi.printJob(job.GSON()).catch((err) => showError(err.message));
};

const demoBarcode2 = () => {
    let job = new RawBTPrintJob();

    // attr for barcode
    let a = new AttributesBarcode().setHeight(64).setHri(HRI_BELOW);

    // attr for title
    let attrStrTitle = new AttributesString()
        .setAlignment(ALIGNMENT_CENTER)
        .setDoubleHeight(true)
        .setDoubleWidth(true);

    job.println("UPC-A", attrStrTitle);
    job.barcode("40204020402", a.setType(BARCODE_UPC_A).build());
    job.ln();

    job.println("UPC-E", attrStrTitle);
    job.barcode("0402402", a.setType(BARCODE_UPC_E).build());
    job.ln();

    job.println("EAN13", attrStrTitle);
    job.barcode("4606224236582", a.setType(BARCODE_EAN13).build());
    job.ln();

    job.println("EAN8", attrStrTitle);
    job.barcode("4020402", a.setType(BARCODE_EAN8).build());
    job.ln();

    job.println("CODE39", attrStrTitle);
    job.barcode("RAWBT-402D", a.setType(BARCODE_CODE39).build());
    job.ln();

    job.println("ITF", attrStrTitle);
    job.barcode("30712345000010", a.setType(BARCODE_ITF).build());
    job.ln();

    job.println("CODOBAR", attrStrTitle);
    job.barcode("A4020402A", a.setType(BARCODE_CODABAR).build());
    job.ln();

    job.println("CODE93", attrStrTitle);
    job.barcode("RAWBT-402-/+", a.setType(BARCODE_CODE93).build());
    job.ln();

    job.println("CODE128", attrStrTitle);
    job.barcode("RawBT402d", a.setType(BARCODE_CODE128).build());
    job.ln();

    RawbtApi.printJob(job.GSON()).catch((err) => showError(err.message));
};

// -----------------------------------
//  PRINT IMAGE
// -------------------------------------

const demoImages = async () => {
    try {
        let imageUri = Image.resolveAssetSource(require("./assets/bwlogo.webp")).uri;
        let base64String = await RawbtApi.getImageBase64String(imageUri);

        let job = new RawBTPrintJob();

        let attrStrTitle = new AttributesString()
            .setAlignment(ALIGNMENT_CENTER)
            .setDoubleHeight(true)
            .setDoubleWidth(true);
        job.println("Images", attrStrTitle);
        job.println(
            "The picture is scaled to the width of the printer as a fraction. 16/16 means full width.Values 1-16 allowed."
        );

        job.image(base64String);

        job.ln();
        job.println("Scale 16(default) - full width");
        job.ln();

        let im50center = new AttributesImage(ALIGNMENT_CENTER, 8);

        job.image(base64String, im50center);
        job.ln();
        job.println("Scale: 8(50%). Alignment: center");
        job.ln();

        let im75right = new AttributesImage(ALIGNMENT_RIGHT, 12);

        job.image(base64String, im75right);
        job.ln();
        job.println("Scale: 12(75%). Alignment: right");
        job.ln();

        let im25left = new AttributesImage()
            .setScale(4)
            .setAlignment(ALIGNMENT_LEFT);
        job.image(base64String, im25left);
        job.ln();
        job.println("Scale: 4(25%). Alignment: left");
        job.ln();

        let imRotated = new AttributesImage().setRotateImage(true);
        job.image(base64String, imRotated);
        job.ln();
        job.println("Rotate");
        job.ln(3);

        RawbtApi.printJob(job.GSON()).catch((err) => showError(err.message));
    } catch(err) {
        showError(err.message);
    }
}



// *******************************************
//  APP
// *******************************************
export default function App() {
    // --------------
    // need append
    // --------------
    useEffect(() => {
        RawbtApi.init();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image source={require("./assets/rawbt.png")} style={styles.imgMain}/>
                <View style={styles.mainpart}>
                    <Text style={styles.p}>
                        The RawBT program is over four years old. Operating system
                        requirements are changing. Technical debt has accumulated as new
                        features are added. It's time for a big refactoring of the code.
                        This is an intermediate version. Its main purpose is to check
                        compatibility with the previous integration methods.
                    </Text>
                    <Text style={styles.p}>
                        The program is now converting the previous methods of interaction
                        into a new format, and in the future, some of them will receive the
                        status of undesirable. The exact dates are not yet known. I promise
                        at least one year of support for old calls after the official
                        transition to the new api.
                    </Text>
                    <Text style={styles.p}>
                        Below is a demonstration of the possibilities for clarifying the
                        requirements for the new api from your side and testing.
                    </Text>
                    <Text style={styles.p}>
                        The concept of a print job is introduced.
                    </Text>

                    <Text style={styles.large}>RawbtPrintJob</Text>
                    <Text style={styles.p}>
                        For the further development of the program, I lay down the choice of
                        a printer and a print template.
                    </Text>

                    <Button title="Print" onPress={printHello}/>

                    <Text style={styles.p}>
                        A print job consists of a list of print commands. Such as text
                        printing, picture printing, etc. The corresponding attribute classes
                        are used to refine the appearance.
                    </Text>

                    <Text style={styles.large}>print()</Text>
                    <Text style={styles.p}>
                        Available control of font style and alignment.
                    </Text>
                    <Button title="Print" onPress={demoFonts}/>

                    <Text style={styles.large}>image()</Text>
                    <Text style={styles.p}>
                        Image attributes: alignment, scale in relation to the width of
                        printers, graphic filter.
                    </Text>
                    <Button title="Print" onPress={demoImages}/>

                    <Text style={styles.large}>barcode()</Text>
                    <Text style={styles.p}>
                        The program generates a picture of a barcode on its own. This allows
                        you not to depend on the technical capabilities of the printer
                        itself.
                    </Text>
                    <Button title="Print" onPress={demoBarcode}/>

                    <Text style={[styles.p, {marginTop: 32, marginBottom: 16}]}>
                        Options are available to customize the appearance of the barcode.
                    </Text>
                    <Button title="Print" onPress={demoBarcode2}/>

                    <Text style={styles.large}>Additional formating options</Text>
                    <Text style={styles.p}>
                        To simplify common tasks, I have added a number of functions. Draw a
                        character string to the full width of the printer. In the future,
                        others will be added: Display a table, QRcode, sound a signal, open
                        a box and others. Collecting your needs.
                    </Text>
                    <Button title="Print" onPress={demoRichFormat}/>
                    <Text style={[styles.p, {marginTop: 32, marginBottom: 16}]}>Bonus demo</Text>
                    <Button title="Receipt example" onPress={demoReceipt}/>
                </View>
            </ScrollView>
            <StatusBar style="auto"/>
            <PrinterProgress height={4} color='blue' />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    mainpart: {
        padding: 16,
    },
    imgMain: {
        flex: 1,
        width: 300,
        height: 300,
        left: "50%",
        marginLeft: -150,
        resizeMode: "contain",
    },
    p: {
        fontSize: 14,
        marginBottom: 8,
        marginTop: 8,
    },
    large: {
        marginTop: 32,
        marginBottom: 8,
        fontSize: 22,
    },
});
