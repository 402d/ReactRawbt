import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    NativeEventEmitter,
    NativeModules,
} from 'react-native';
import {RawBtProgress} from "./rawbtapi";
const {ReactNativeLoading} = NativeModules;


export type PrinterProgressProps = {

    /**
     * The tint color of the progress bar itself.
     *
     * @default #007aff
     */
    color?: string;

    /**
     * The tint color of the progress bar track.
     *
     * @default transparent
     */
    trackColor?: string;


    /**
     * Height of the loading indicator.
     *
     * @default 7
     */
    height?: number;

    /**
     * Border radius of the loading indicator.
     *
     * @default height / 2
     */
    borderRadius?: number;

};
let subscription ;
let timer = null;

function PrinterProgress({
                             height = 7,
                             borderRadius = height * 0.5,
                             color = '#007aff',
                         }: PrinterProgressProps) {

    const [printerStatus:RawBtProgress,setPrinterStatus] = useState({status:'unknown',message:'no message',progress:0});


    useEffect(()=>{
        if(subscription === undefined) {
            const loadingManagerEmitter = new NativeEventEmitter(ReactNativeLoading);
            subscription = loadingManagerEmitter.addListener("RawBT", ({status,progress,message}) => {
                setPrinterStatus({status:status,message:message,progress:progress});
            });
        }
    });


    if(timer != null){
        clearTimeout(timer);
    }

    if(printerStatus.progress>0){
        return (
            <View style={styles.container}>
                <View style={{borderRadius: borderRadius, borderWidth:1, borderColor:color,width:'100%',height:height+2}}
                ><View style={{borderRadius: borderRadius,
                    backgroundColor:color,
                    position: 'absolute',left:0,top:0,
                    width:printerStatus.progress+'%',height:height}} /></View>
            </View>
        );
    }

    if(printerStatus.status === "error"){
        return (
            <View style={[styles.container,{backgroundColor:'red'}]}>
                <Text style={styles.title}>PRINTER ERROR</Text>
                <Text style={{color: 'white'}}>{printerStatus.message}</Text>
                <TouchableOpacity onPress={() => setPrinterStatus({status:'cancelled'})}>
                    <Text style={styles.btn}>CLOSE</Text>
                </TouchableOpacity>
                
            </View>
        );
    }

    if(printerStatus.status === "info" || printerStatus.status === "connected") {


        timer = setTimeout(() => setPrinterStatus({status: 'hide'}), 2000);


        return (
            <View style={styles.container}>
                <Text>{printerStatus.message}</Text>
            </View>
        );
    }

    // success, canceled

    return (<View/>);

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EEE',
        overflow: 'hidden',
        position: 'absolute',
        top: Platform.OS === "android" ? 25 : 0,
    },
    btn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFF',
        color:'#F00',
        marginTop:16
    },
    title : {
        fontSize: 16,
        color: '#FFF'
    }
});

export default PrinterProgress