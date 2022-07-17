# ReactRawbt
How to use the RawBT API from React Native

RawBT - служба печати для андроида на термопринтерах. 

Пример использования API https://github.com/402d/RawbtAPI

Я андроид разработчик, за 2 недели как мог разобрался в React Native. 
**Возможно кого то из специализирующихся на реакте заинтересует довести до ума.** 

Цель. 
Публикация апи как отдельного подключаемого модуля через npm

Доработки, которые я вижу
1. Полноценный RCTDeviceEventEmitter. Сейчас просто строка
2. Доделать QR и другие методы поддерживаемые службой
3. Навести порядок с коде стайлом (думаю сильно торчат уши привычных мне стеков)
4. Документирование
5. Выделение в отдельно публикуемый модуль


## How run examle
```
git clone https://github.com/402d/ReactRawbt.git
cd ReactRawbt
npm install
expo run:android
```
## Preview print out
RawBT может использоваться для отладки печатных форм без наличия самого термопринтера. 
В приложении реализован режим виртуального принтера. 
Доступен моментальный просмотр и сохранение изображений в галерею. 
Подробнее об эмулируемых командах
https://github.com/402d/Virtual_POS_printer


## Install RawBT
https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter
