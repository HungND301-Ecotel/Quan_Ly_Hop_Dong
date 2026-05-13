# Payment Due Soon Query - Updated Implementation

## S?a l?i logic GetAllContractsWithPaymentDueSoonAsync

### ?? Tóm t?t thay ð?i

#### 1. Thêm Helper Methods vào PaymentSchedule Base Class
**File**: `src\Core\Domain\Entities\Catalog\PaymentSchedule\PaymentSchedule.cs`

```csharp
/// <summary>
/// L?y ngày s?p ð?n h?n thanh toán c?a payment schedule
/// </summary>
public abstract DateTimeOffset? GetDueDate();

/// <summary>
/// Ki?m tra xem payment schedule có s?p ð?n h?n không (trong v?ng daysBefore)
/// </summary>
public bool IsPaymentDueSoon(int daysBefore)
{
    if (PaymentStatus != PaymentStatus.Unpaid)
    {
        return false;
    }

    var dueDate = GetDueDate();
    if (!dueDate.HasValue)
    {
        return false;
    }

    var today = DateTimeOffset.UtcNow;
    var thresholdDate = today.AddDays(daysBefore);

    return dueDate.Value >= today && dueDate.Value <= thresholdDate;
}
```

**Tính nãng**:
- `GetDueDate()`: Abstract method, m?i subclass t? implement
- `IsPaymentDueSoon()`: Ki?m tra n?u payment:
  - Status = Unpaid
  - Due date n?m trong kho?ng [Today, Today + DaysBefore]

---

#### 2. Implement GetDueDate() trong các Payment Schedule Types

**MonthlyPaymentSchedule**: 
```csharp
public override DateTimeOffset? GetDueDate()
{
    try
    {
        var daysInMonth = DateTime.DaysInMonth(Year, Month);
        var dueDate = new DateTime(Year, Month, daysInMonth, 23, 59, 59);
        return new DateTimeOffset(dueDate, TimeSpan.Zero);
    }
    catch
    {
        return null;
    }
}
```
? Due date = ngày cu?i cùng c?a tháng

**QuarterlyPaymentSchedule**:
```csharp
public override DateTimeOffset? GetDueDate()
{
    try
    {
        var month = (Quarter - 1) * 3 + 3; // Q1=3, Q2=6, Q3=9, Q4=12
        var daysInMonth = DateTime.DaysInMonth(Year, month);
        var dueDate = new DateTime(Year, month, daysInMonth, 23, 59, 59);
        return new DateTimeOffset(dueDate, TimeSpan.Zero);
    }
    catch
    {
        return null;
    }
}
```
? Due date = ngày cu?i cùng c?a tháng k?t thúc qu?

**YearlyPaymentSchedule**:
```csharp
public override DateTimeOffset? GetDueDate()
{
    try
    {
        var dueDate = new DateTime(Year, 12, 31, 23, 59, 59);
        return new DateTimeOffset(dueDate, TimeSpan.Zero);
    }
    catch
    {
        return null;
    }
}
```
? Due date = 31/12 c?a nãm

**LumpSumPaymentSchedule**:
```csharp
public override DateTimeOffset? GetDueDate()
{
    return DueDate;
}
```
? Due date = DueDate property

**StagePaymentSchedule**:
```csharp
public override DateTimeOffset? GetDueDate()
{
    return ToDate;
}
```
? Due date = ToDate (ngày k?t thúc giai ðo?n)

---

#### 3. C?p nh?t GetAllContractsWithPaymentDueSoonAsync

**File**: `src\Infrastructures\Infrastructure\Services\Catalog\ContractService\ContractService.cs`

**Logic m?i**:
1. ? L?y `NotificationConfig` v?i `EventType = PaymentDue` và `isEnabled = true`
2. ? L?y `DaysBefore` t? c?u h?nh
3. ? Query contracts theo:
   - `ContractFormat` (ðý?c truy?n vào)
   - `Status == ContractStatus.Active`
   - Include `PaymentSchedules`
4. ? Filter trong memory (C#):
   - Ch? l?y contracts có payment schedule nào:
     - `PaymentStatus = Unpaid`
     - `DueDate n?m trong [Today, Today + DaysBefore]`
5. ? Sort contracts theo earliest payment due date
6. ? Tr? v? `List<ShortContractDto>`

---

## ?? Ví d? s? d?ng

```csharp
// CQRS Request
var query = new GetAllContractsWithPaymentDueSoonQuery(ContractFormat.EconomicBuy);
var contractsWithPaymentDue = await mediator.Send(query);

// API Endpoint
[HttpGet("payment-due-soon")]
public async Task<IActionResult> GetPaymentDueSoonContracts([FromQuery] ContractFormat contractFormat)
{
    var query = new GetAllContractsWithPaymentDueSoonQuery(contractFormat);
    var result = await Mediator.Send(query);
    return Ok(result); // Tr? v? contracts có payment s?p ð?n h?n
}
```

---

## ? Các tính nãng chính

? Ki?m tra t?ng PaymentSchedule trong contract  
? H? tr? t?t c? lo?i payment schedule (Monthly, Quarterly, Yearly, LumpSum, Stage)  
? Ch? l?y unpaid payments  
? Ki?m tra due date trong kho?ng DaysBefore  
? Sort theo earliest due date (s?p h?t h?n nh?t trý?c)  
? Týõng thích 100% v?i pattern CQRS/MediatR  
? T?i ýu hi?u su?t v?i NoTracking  
? Safe handling: try-catch cho date calculations  

---

## ?? So sánh logic c? vs m?i

| Aspct | Logic c? | Logic m?i |
|-------|---------|-----------|
| **Basis** | EndDate c?a contract | PaymentSchedules c?a contract |
| **Filter** | Contract EndDate | Payment schedule DueDate |
| **Condition** | Status = Active | Status = Active + Unpaid payments |
| **Scope** | Toàn b? contract | Ch? unpaid payments |
| **Sort** | By contract EndDate | By earliest payment due date |

---

## ?? Build Status: ? Successful
