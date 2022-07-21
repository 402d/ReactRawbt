package rawbt.api;

import android.content.ComponentName;
import android.content.Context;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import rawbt.sdk.ICallback;
import rawbt.sdk.IRawBtPrintService;


public class RNRawbtLibraryModule extends ReactContextBaseJavaModule {

  final protected Handler handler = new Handler(Looper.getMainLooper());
  // -----------------------------------------

  public volatile IRawBtPrintService serviceRawBT = null;
  private final ServiceConnection connectService = new ServiceConnection() {

    @Override
    public void onServiceConnected(ComponentName name, IBinder s) {
      serviceRawBT = IRawBtPrintService.Stub.asInterface(s);
      try {
        serviceRawBT.registerCallback(serviceCallback);
        handler.post(()-> handleServiceConnected());
      } catch (Exception e) {
        handlePrintError(e.getLocalizedMessage());
      }
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
      serviceRawBT = null;
      handler.postDelayed(()-> bindRawBT(),5000);
    }

  };

  // -----------------------------------------

  final ICallback serviceCallback = new ICallback.Stub() {

    @Override
    public void onPrintSuccess(String jobId)  {
      handler.post(()-> handlePrintSuccess());
    }

    @Override
    public void onPrintError(String jobId,String errMessage) {
      final String finalMes = errMessage;
      handler.post(()-> handlePrintError(finalMes));
    }

    @Override
    public void onPrintCancel(String jobId) {
      handler.post(()-> handlePrintCancel());
    }

    @Override
    public void onProgress(String jobId, float p)  {
      final float finalP = p;
      handler.post(()-> handlePrintProgress(finalP));
    }


  };

  protected void bindRawBT(){
    try {
      reactContext.bindService(RawbtApiHelper.createExplicitIntent(), connectService, Context.BIND_AUTO_CREATE);
    }catch (SecurityException s){

        handlePrintError(reactContext.getString(R.string.rawbt_permission_not_granted));

    }catch (Exception e) {
      handlePrintError(reactContext.getString(R.string.rawbt_connect_error));
    }
  }



  private final ReactApplicationContext reactContext;


  // --------------------------------------------------------------

  public RNRawbtLibraryModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @ReactMethod
  public void init(){
    if(serviceRawBT == null){
      bindRawBT();
    }
  }

  @ReactMethod
  public void printJob(@NonNull String jobGSON, Promise promise){
    if(serviceRawBT == null){
      if(!RawbtApiHelper.isServiceInstalled(reactContext)){
        promise.reject("Error", reactContext.getString(R.string.rawb_not_installed));
        return;
      }
      promise.reject("Error", reactContext.getString(R.string.rawbt_please_wait));
      return;
    }
    try{
      serviceRawBT.printRawbtPrintJob(jobGSON);
      promise.resolve(true);
    }catch (SecurityException s){
      promise.reject("Error", reactContext.getString(R.string.rawbt_permission_not_granted));
    }catch (Exception e){
      promise.reject("Error", "Exception: "  + e.getLocalizedMessage());
    }
  }

  private final String eventName = "RawBT";
  public final class EventInfo {
    String status = "unknown";
    Float progress = 0f;
    String message = "";

    public EventInfo(String status) {
      this.status = status;
      this.message = status;
    }

    public EventInfo(String status, String message) {
      this.status = status;
      this.message = message;
    }

    public EventInfo(String status, Float progress) {
      this.status = status;
      this.message = status;
      this.progress = progress;
    }

    public WritableMap get(){
      WritableMap params = Arguments.createMap();
      params.putString("status",this.status);
      params.putString("message",this.message);
      params.putInt("progress",(int)(this.progress * 100));
      return params;
    }
  }

  protected void handleServiceConnected(){

    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,new EventInfo("connected").get());

  }
  protected void handlePrintSuccess(){
    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,new EventInfo("success").get());

  }
  protected void handlePrintCancel(){
    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,new EventInfo("canceled").get());
  }
  protected void handlePrintError(String message){
    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,new EventInfo("error",message).get());
  }
  protected void handlePrintProgress(Float p){
    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,new EventInfo("progress",p).get());
  }

  // --------------

  @ReactMethod
  public void getImageBase64String(String uri, Promise promise) {
    Bitmap image;
    try {
      if (uri.startsWith("http")) {
        image = getBitmapFromURL(uri);
      } else {
        image = MediaStore.Images.Media.getBitmap(reactContext.getContentResolver(), Uri.parse(uri));
      }
      if (image == null) {
        promise.reject("Error", "Failed to decode Bitmap, uri: " + uri);
      } else {
        promise.resolve(bitmapToBase64(image));
      }
    } catch (Error e) {
      promise.reject("Error", "Failed to decode Bitmap: " + e);
      e.printStackTrace();
    } catch (Exception e) {
      promise.reject("Error", "Exception: " + e.getLocalizedMessage());
      e.printStackTrace();
    }
  }

  public Bitmap getBitmapFromURL(String src) {
    try {
      URL url = new URL(src);
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setDoInput(true);
      connection.connect();
      InputStream input = connection.getInputStream();

      Bitmap bitmap = BitmapFactory.decodeStream(input);

      try {
        input.close();
        connection.disconnect();
      }catch (Exception ignored){}

      return bitmap;
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }

  private String bitmapToBase64(Bitmap bitmap) {
    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
    byte[] byteArray = byteArrayOutputStream.toByteArray();
    return Base64.encodeToString(byteArray, Base64.DEFAULT);
  }

  // --------------

  @NonNull
  @Override
  public String getName() {
    return "RNRawbtLibraryModule";
  }
}