# オーディオ デバイスの設定

<span class="badge text-bg-primary">上級</span>
<span class="badge text-bg-success">プログラマー</span>

使用するオーディオ デバイスを設定できます。たとえば、_Oculus Rift_ オーディオ デバイスにカスタム ゲームのコンストラクターからアクセスできます。

デバイスを指定しないと、既定のオーディオ デバイスが使用されます。

## コード例

このコードでは、実行時に Oculus Rift デバイスを設定します。

```cs
namespace OculusRenderer
{
    public class OculusGame : Game
    {
        public OculusGame()
        {
            var deviceName = OculusOvr.GetAudioDeviceFullName();
            var deviceUuid = new AudioDevice { Name = deviceName };
            Audio.RequestedAudioDevice = deviceUuid;
        }
    }
}
```

## 関連項目
* [グローバル オーディオ設定](global-audio-settings.md)
