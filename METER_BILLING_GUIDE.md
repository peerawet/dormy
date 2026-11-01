# คู่มือออกบิลค่าไฟจากรูปมิเตอร์ บ้านพักพัศดี (สำหรับ Claude)

ไฟล์นี้เขียนให้ Claude อ่าน งานคือ: เจ้าของหอส่งรูปแผงมิเตอร์ไฟมา → Claude อ่านเลข → ดึงข้อมูลห้องและเลขเดือนก่อนจากระบบ Dormy → คำนวณบิล → ให้เจ้าของยืนยัน → ออกบิลทั้ง 5 ห้องพร้อมกันผ่าน API → ส่งข้อความบิลห้องละชุดให้เจ้าของ copy ไปส่ง LINE ผู้เช่า

---

## 0. ตั้งค่าครั้งแรก (เจ้าของหอทำเอง ครั้งเดียว)

1. บน claude.ai สร้าง Project เช่น "Dormy บิลค่าไฟ" แล้วอัปโหลดไฟล์นี้เป็น Project knowledge จากนั้นเปิด Project นี้ในแอปมือถือแล้วส่งรูปได้เลย
2. เปิด Code execution และอนุญาตให้เข้าถึงโดเมน `dormy-xi.vercel.app` (อยู่ใน Settings ส่วน Capabilities หรือ Code execution ชื่อเมนูอาจต่างกันตามเวอร์ชันแอป) ถ้าเปิดไม่ได้ให้ใช้ "โหมด B" ในหัวข้อ 6
3. **ห้ามใส่อีเมลหรือรหัสผ่านไว้ในไฟล์นี้** ให้พิมพ์ในแชทตอนที่ Claude ขอเท่านั้น

---

## 1. ข้อมูลระบบ

- API: `https://dormy-xi.vercel.app` (โดเมนเก่า `dormy.forifi.xyz` ใช้ไม่ได้แล้ว ห้ามใช้)
- Auth: `POST /api/login` ด้วย `{"email", "password"}` จะได้ `{"token"}` (อายุ 7 วัน) จากนั้นใส่ header `Authorization: Bearer <token>` ทุก request

| ใช้ทำอะไร | Endpoint | สิ่งที่ได้ |
|---|---|---|
| หอ ห้อง ผู้เช่า | `GET /api/dormitory` | `dorms[].rooms[]` แต่ละห้องมี `id, name, price, electricRate, electricFlat, waterRate, waterFlat, commonFee, otherFee, tenantRooms[].tenant, rentalContracts[]` |
| บิลเดิมของห้อง | `GET /api/bill?roomId=<id>` | `bills[]` เรียงจากใหม่ไปเก่า ใบแรกคือบิลล่าสุด มี `billDate, meterElectricStart, meterElectricEnd` |
| ออกบิลหลายห้อง | `POST /api/bill/bulk` | body `{"bills": [...]}` ตอบ `successCount, failedCount, message` |

ฟิลด์เงินทุกตัวและเลขมิเตอร์เป็น**จำนวนเต็ม** บิลเดิมในระบบ**ปัดเศษลงทุกใบ** (เช่น 89 หน่วย × 5.5 = 489.5 → 489) ต้องปัดแบบเดียวกัน

---

## 2. หอและแผงมิเตอร์

หอ **บ้านพักพัศดี** มี 5 ห้อง ไม่มีมิเตอร์น้ำ (ค่าน้ำเหมาห้องละ 100) ไม่มีค่าส่วนกลางหรือค่าอื่น ๆ มิเตอร์ไฟเป็นวงล้อ 4 หลัก วนรอบที่ 10000

แผงมีมิเตอร์ 5 ตัวเรียงเป็นแถว นับตำแหน่ง**จากซ้ายไปขวา**:

| ตำแหน่ง | ห้องในระบบ (`room.name`) | ใช้ไฟปกติ (หน่วย/วัน) | หมายเหตุ |
|---|---|---|---|
| 1 | `ชั้น2` | 2–3 | อยู่มุมซ้ายที่มืด เลขมักอ่านยาก |
| 2 | `ชั้น3` | 2–3 | เลขใกล้ 9999 จะวนรอบเป็น 0000 ในไม่กี่เดือน |
| 3 | `ชั้น4` | 2.5–4.5 | |
| 4 | `ชั้น1 ด้านหลัง` | 0.4–2 | ใช้ไฟน้อยที่สุด |
| 5 | `ชั้น1` | 4–7 | ใช้ไฟมากที่สุด |

กติกา:
- **ห้ามดูเลขที่เขียนด้วยมือบนกล่องมิเตอร์** กล่องตำแหน่ง 1–3 มีเลข "4", "3", "2" เขียนไว้ แต่**ไม่ใช่เลขชั้น** (กล่องที่เขียน "4" คือชั้น2 กล่องที่เขียน "2" คือชั้น4) ให้ใช้ตำแหน่งตามตารางนี้เท่านั้น
- ชื่อห้องต้องตรงตามตารางทุกตัวอักษร รวมถึงช่องว่างใน `ชั้น1 ด้านหลัง`
- ถ้ารูปมีมิเตอร์ไม่ครบ 5 ตัว ถ่ายเอียงจนบอกลำดับไม่ได้ หรือดูเหมือนแผงเปลี่ยนไป ให้หยุดแล้วถามเจ้าของ
- ค่าเช่าและเรทค่าไฟเปลี่ยนได้ สคริปต์ดึงค่าล่าสุดจากระบบทุกครั้ง ห้ามใช้ตัวเลขที่จำไว้

---

## 3. ขั้นตอนทุกเดือน

### ขั้นที่ 1: รับรูปและถามวันที่บิล
- ถามวันที่ของบิล ถ้าเจ้าของไม่ระบุ ให้เสนอวันนี้ (เวลาไทย) ในรูปแบบ `YYYY-MM-DD`
- หอนี้ออกบิลไม่ตรงวันทุกเดือน (ห่างกัน 3–6 สัปดาห์) จึงไม่ต้องกังวลว่าวันที่ต้องตรงรอบ

### ขั้นที่ 2: อ่านเลขมิเตอร์
- อ่านเฉพาะ**วงล้อตัวเลข 4 หลัก** ไม่เอาวงล้อหรือขีดเล็ก ๆ ทางขวาสุด
- ถ้าวงล้อค้างอยู่ระหว่างสองตัวเลข ให้อ่านตัว**ที่น้อยกว่า** (ถ้าค้างระหว่าง 9 กับ 0 ให้อ่าน 9)
- อ่านจากรูปเท่านั้น ห้ามเอาเลขเดือนก่อนมาช่วยเดา ใช้เลขเดือนก่อนแค่ตรวจทานในขั้นที่ 4
- ให้ระดับความมั่นใจแต่ละตัว: สูง / กลาง / ต่ำ ถ้าตัวไหน "ต่ำ" ให้ขอรูปใหม่เฉพาะตัวนั้น (ถ่ายตรงหน้า ใกล้ขึ้น เปิดแฟลช เลี่ยงแสงสะท้อนจากฝาครอบ)
- แสดงผลการอ่านให้เจ้าของดูก่อนไปต่อ:

  ```
  1 ชั้น2          | 1234 | มั่นใจต่ำ: มืด หลักที่ 3 อาจเป็น 2 หรือ 8
  2 ชั้น3          | 1234 | มั่นใจกลาง
  3 ชั้น4          | 1234 | มั่นใจสูง
  4 ชั้น1 ด้านหลัง | 1234 | มั่นใจกลาง
  5 ชั้น1          | 1234 | มั่นใจสูง
  ```

### ขั้นที่ 3: ดึงข้อมูลและคำนวณ (ยังไม่สร้างบิล)
- ขออีเมลและรหัสผ่านของบัญชีเจ้าของหอในแชท ใช้ในโค้ดเท่านั้น **ห้ามพิมพ์ซ้ำ ห้ามแสดงในผลลัพธ์ ห้าม print token**
- รัน `prepare()` จากสคริปต์ในหัวข้อ 5 ฟังก์ชันนี้แค่อ่านข้อมูลจากระบบ ไม่สร้างอะไร

### ขั้นที่ 4: ตรวจความผิดปกติ
สคริปต์จะใส่ `problems` (ห้องนั้นจะไม่ถูกออกบิล) และ `warnings` (ออกบิลได้แต่ต้องแจ้ง) ให้ Claude อธิบายให้เจ้าของเข้าใจทุกข้อ:
- **เลขใหม่น้อยกว่าเลขเก่า:** มิเตอร์วนรอบหรืออ่านผิด ชั้น3 มีโอกาสวนรอบมากที่สุด ถ้าเจ้าของยืนยันว่าวนรอบ (เช่น 9990 → 0015) ให้ใส่ `"electric_wrap": 10000` แล้วรันใหม่
- **ใช้ไฟต่ำหรือสูงผิดปกติ** (เทียบกับการใช้ต่อวันของห้องนั้นคูณจำนวนวันตั้งแต่บิลล่าสุด): ให้ดูรูปซ้ำ น่าจะอ่านเลขผิดสักหลัก โดยเฉพาะตำแหน่ง 1 ที่มืด
- **บิลล่าสุดห่างไม่ถึง 15 วัน:** อาจเป็นการออกบิลซ้ำ ถามเจ้าของก่อน ถ้าตั้งใจจริงให้ใส่ `"allow_recent": true`
- **ไม่มีเลขเดือนก่อน:** ถามเลขเริ่มต้นจากเจ้าของ แล้วใส่ `"electric_start": <เลข>`
- **ห้องว่างหรือระบุผู้เช่าไม่ได้:** ข้ามห้องนั้นและแจ้งเจ้าของ

### ขั้นที่ 5: ให้เจ้าของยืนยัน
แสดงสรุปทีละห้อง (บนมือถือใช้รายการห้องละบรรทัดดีกว่าตารางกว้าง):

```
ชั้น1: 6500→6600 (100 หน่วย × 6.5) ไฟ 650 + น้ำ 100 + เช่า 3300 = 4,050 บาท
```

แจ้งห้องที่ถูกข้ามพร้อมเหตุผล แล้วถามตรง ๆ ว่า "ยืนยันออกบิล N ห้องนี้ไหม" **ต้องได้คำยืนยันชัดเจนก่อน** ถ้าเจ้าของขอแก้ (เช่น ใส่ส่วนลด หรือแก้เลข) ให้รัน `prepare()` ใหม่แล้วแสดงสรุปอีกรอบ

### ขั้นที่ 6: ออกบิล
- รัน `commit()` ซึ่งส่ง `payload.json` ชุดเดียวกับที่เจ้าของยืนยัน
- รายงาน `message` จาก API ให้เจ้าของ
- ถ้า `failedCount > 0` **ห้ามส่งซ้ำทั้งชุด** ให้ดึง `GET /api/bill?roomId=` ของห้องที่ล้มเหลวก่อน เพื่อดูว่าบิลถูกสร้างไปแล้วหรือยัง แล้วค่อยส่งเฉพาะห้องที่ยังไม่มีบิล

### ขั้นที่ 7: ส่งข้อความบิลให้เจ้าของ copy ไปส่ง LINE
`commit()` จะพิมพ์ข้อความบิลของห้องที่สร้างสำเร็จออกมา คั่นด้วย `===== ห้อง → ผู้เช่า =====` ให้ Claude แสดงผลแบบนี้:

- **ห้องละ 1 code block** แยกกัน เพื่อให้เจ้าของกดปุ่ม copy ทีละห้องแล้ววางในแชท LINE ของผู้เช่าคนนั้นได้ทันที
- เหนือแต่ละ block เขียนหัวข้อสั้น ๆ นอก block ว่าส่งให้ใคร เช่น **ชั้น1 → สมชาย**
- เรียงตามลำดับที่สคริปต์พิมพ์ (ชั้น1, ชั้น2, ชั้น3, ชั้น4, ชั้น1 ด้านหลัง)
- ข้อความใน block ต้อง**ตรงกับ output ของสคริปต์ทุกตัวอักษร** ห้ามพิมพ์ตัวเลขเอง ห้ามแก้ ห้ามเพิ่ม markdown (LINE ไม่แสดง markdown)
- ถ้าเจ้าของขอข้อความชุดเดิมอีกครั้ง ให้รัน `messages()` (อ่านจาก `context.json` ไม่ต้องยิง API)

ตัวอย่างหน้าตา (ตัวเลขสมมติ):

**ชั้น1 → สมชาย**
```
🏠 บ้านพักพัศดี | ชั้น1
บิลวันที่ 1 ธ.ค. 2569
สมชาย

ค่าเช่า 3,300 บาท
ค่าไฟ 650 บาท
(6500 → 6600 = 100 หน่วย × 6.5)
ค่าน้ำ 100 บาท
━━━━━━━━━━
💰 รวม 4,050 บาท

💳 พร้อมเพย์ 065-502-6360
พีรเวทย์ เชื้อสุข
โอนแล้วส่งสลิปในแชทนี้ได้เลย ขอบคุณ 🙏
```

---

## 4. สูตรคำนวณ (ตรงกับบิลที่มีอยู่ในระบบ)

- **ค่าไฟ** = ปัดลง((เลขใหม่ − เลขเก่า) × `electricRate`)
- **เลขเก่า** = `meterElectricEnd` ของบิลล่าสุดของห้องนั้น
- **ค่าน้ำ** = `waterFlat` (100)
- **ค่าเช่า** = `price`, **ค่าส่วนกลาง** = `commonFee`, **ค่าอื่น ๆ** = `otherFee` (ไม่มีให้เป็น 0)
- **ยอดรวม** = ค่าน้ำ + ค่าไฟ + ค่าส่วนกลาง + ค่าอื่น ๆ + ค่าเช่า − ส่วนลด
- **ผู้เช่า:** แต่ละห้องมีผู้เช่าคนเดียว สคริปต์ดึงจาก `tenantRooms`

---

## 5. สคริปต์อ้างอิง (Python)

ตัวแปร Python อาจไม่ค้างข้ามการรันแต่ละครั้ง ให้บันทึกสคริปต์นี้เป็นไฟล์ `dormy.py` แล้ว import ใช้ ส่วน `prepare()` จะบันทึก payload ลง `payload.json` ให้ `commit()` อ่านจากไฟล์นั้นต่อ

```python
import json
import math
import urllib.error
import urllib.request
from datetime import date

BASE = "https://dormy-xi.vercel.app"
PROMPTPAY = "065-502-6360"
PROMPTPAY_NAME = "พีรเวทย์ เชื้อสุข"


def call(method, path, token=None, body=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()[:300]}")


def login(email, password):
    return call("POST", "/api/login", body={"email": email, "password": password})["token"]


def baht(x):
    return math.floor(x + 1e-9)  # บิลเดิมในระบบปัดเศษลงทุกใบ


def day(s):
    return date.fromisoformat(s[:10])


MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]


def thai_date(s):
    d = day(s)
    return f"{d.day} {MONTHS[d.month - 1]} {d.year + 543}"


def money(n):
    return f"{n:,}"


def meter_charge(kind, rate, flat, start, end, wrap=None):
    """คืน (หน่วย, ค่าเงิน, ปัญหา) หน่วยเป็น None ถ้าไม่ได้คิดตามมิเตอร์"""
    if rate and end is not None:
        if start is None:
            return None, 0, f"ไม่มีเลขมิเตอร์{kind}เดือนก่อน ต้องให้เจ้าของบอก ({kind}_start)"
        units = end - start
        if units < 0:
            if not wrap:
                return None, 0, f"เลขมิเตอร์{kind}ใหม่ {end} น้อยกว่าเดือนก่อน {start} (วนรอบหรืออ่านผิด)"
            units += wrap
        return units, baht(units * rate), None
    if flat:
        return None, flat, None
    if rate:
        return None, 0, f"ไม่มีเลขมิเตอร์{kind}เดือนนี้"
    return None, 0, None


def per_day_usage(bills):
    """หน่วยไฟเฉลี่ยต่อวันจากบิล 3 ใบล่าสุด"""
    rates = []
    for b, prev in zip(bills[:3], bills[1:4]):
        days = (day(b["billDate"]) - day(prev["billDate"])).days
        s, e = b.get("meterElectricStart"), b.get("meterElectricEnd")
        if days > 0 and s is not None and e is not None and e >= s:
            rates.append((e - s) / days)
    return sum(rates) / len(rates) if rates else None


def prepare(token, bill_date, readings, dorm_name=None):
    """
    bill_date: "YYYY-MM-DD"
    readings: {"<room.name>": {"electric": 1234, "discount": 0,
                               "electric_start": None, "electric_wrap": None,
                               "allow_recent": False}}
    คืน rows สำหรับแสดงผล และบันทึก payload ลง payload.json (ยังไม่สร้างบิล)
    """
    dorms = call("GET", "/api/dormitory", token)["dorms"]
    if dorm_name:
        dorms = [d for d in dorms if d["name"] == dorm_name]
    if len(dorms) != 1:
        raise RuntimeError(f"ระบุหอไม่ได้ พบ {len(dorms)} หอ ให้ส่ง dorm_name")
    unknown = set(readings) - {room["name"] for room in dorms[0]["rooms"]}
    if unknown:
        raise RuntimeError(f"ไม่มีห้องชื่อ {sorted(unknown)} ในระบบ")

    rows, payload = [], []
    for room in sorted(dorms[0]["rooms"], key=lambda r: (len(r["name"]), r["name"])):
        r = readings.get(room["name"], {})
        row = {"room": room["name"], "room_id": room["id"], "problems": [], "warnings": []}
        rows.append(row)

        tenants = [tr["tenant"] for tr in room["tenantRooms"]]
        if not tenants:
            row["problems"].append("ห้องว่าง (ไม่มีผู้เช่า)")
            continue
        if len(tenants) > 1:
            active = {c["tenantId"] for c in room["rentalContracts"]
                      if c["startDate"][:10] <= bill_date <= c["endDate"][:10]}
            tenants = [t for t in tenants if t["id"] in active]
        if len(tenants) != 1:
            row["problems"].append("ระบุผู้เช่าไม่ได้ (มีหลายคน)")
            continue
        tenant = tenants[0]
        row["tenant"] = tenant["name"]

        bills = call("GET", f"/api/bill?roomId={room['id']}", token)["bills"]
        last = bills[0] if bills else {}
        gap = (day(bill_date) - day(last["billDate"])).days if last else None
        if gap is not None and gap < 15 and not r.get("allow_recent"):
            row["problems"].append(
                f"บิลล่าสุดลงวันที่ {last['billDate'][:10]} ห่างแค่ {gap} วัน อาจออกซ้ำ (ถ้าตั้งใจให้ใส่ allow_recent)")

        e_end = r.get("electric")
        e_start = r["electric_start"] if r.get("electric_start") is not None else last.get("meterElectricEnd")
        e_units, electric, p = meter_charge("ไฟ", room["electricRate"], room["electricFlat"],
                                            e_start, e_end, r.get("electric_wrap"))
        if p:
            row["problems"].append(p)

        w_end = r.get("water")
        w_start = r["water_start"] if r.get("water_start") is not None else last.get("meterWaterEnd")
        w_units, water, p = meter_charge("น้ำ", room["waterRate"], room["waterFlat"],
                                         w_start, w_end, r.get("water_wrap"))
        if p:
            row["problems"].append(p)

        usage = per_day_usage(bills)
        if e_units is not None and usage and gap and gap > 0:
            expected = usage * gap
            row["expected_units"] = round(expected)
            if e_units == 0:
                row["warnings"].append("ใช้ไฟ 0 หน่วย")
            elif e_units > 2 * expected:
                row["warnings"].append(f"ใช้ไฟ {e_units} หน่วย สูงผิดปกติ (ปกติราว {expected:.0f} หน่วยใน {gap} วัน)")
            elif e_units < 0.3 * expected:
                row["warnings"].append(f"ใช้ไฟ {e_units} หน่วย ต่ำผิดปกติ (ปกติราว {expected:.0f} หน่วยใน {gap} วัน)")

        common, other, rent = room["commonFee"] or 0, room["otherFee"] or 0, room["price"]
        discount = baht(r.get("discount", 0))
        total = water + electric + common + other + rent - discount
        row.update(electric_start=e_start, electric_end=e_end, electric_units=e_units,
                   electric_rate=room["electricRate"], electric=electric,
                   water_start=w_start, water_end=w_end, water_units=w_units,
                   water_rate=room["waterRate"], water=water,
                   rent=rent, common=common, other=other, discount=discount, total=total)

        if not row["problems"]:
            payload.append({
                "roomId": room["id"], "tenantId": tenant["id"], "billDate": bill_date,
                "water": water, "electric": electric, "common": common, "other": other,
                "rent": rent, "discount": discount, "total": total,
                "meterElectricStart": e_start if e_end is not None else None,
                "meterElectricEnd": e_end,
                "meterWaterStart": w_start if w_end is not None else None,
                "meterWaterEnd": w_end,
            })

    context = {"dorm": dorms[0]["name"], "bill_date": bill_date, "rows": rows}
    with open("payload.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    with open("context.json", "w", encoding="utf-8") as f:
        json.dump(context, f, ensure_ascii=False, indent=2)
    print(json.dumps(rows, ensure_ascii=False, indent=2))
    print(f"\nพร้อมออกบิล {len(payload)} ห้อง (บันทึกใน payload.json) ยังไม่ได้สร้างบิล")
    return rows


def bill_message(ctx, row):
    """ข้อความบิลหนึ่งห้อง เป็นตัวอักษรล้วนสำหรับวางใน LINE"""
    lines = [f"🏠 {ctx['dorm']} | {row['room']}",
             f"บิลวันที่ {thai_date(ctx['bill_date'])}",
             row["tenant"],  # ใช้ชื่อตามระบบ เพราะบางชื่อมีคำนำหน้าอยู่แล้ว (ป้า, นาย, น.ส.)
             "",
             f"ค่าเช่า {money(row['rent'])} บาท"]
    for kind, key in (("ค่าไฟ", "electric"), ("ค่าน้ำ", "water")):
        if row[f"{key}_units"] is not None:
            lines.append(f"{kind} {money(row[key])} บาท")
            lines.append(f"({row[f'{key}_start']} → {row[f'{key}_end']} = "
                         f"{row[f'{key}_units']} หน่วย × {row[f'{key}_rate']:g})")
        elif row[key]:
            lines.append(f"{kind} {money(row[key])} บาท")
    if row["common"]:
        lines.append(f"ค่าส่วนกลาง {money(row['common'])} บาท")
    if row["other"]:
        lines.append(f"ค่าอื่น ๆ {money(row['other'])} บาท")
    if row["discount"]:
        lines.append(f"ส่วนลด -{money(row['discount'])} บาท")
    lines += ["━━━━━━━━━━",
              f"💰 รวม {money(row['total'])} บาท",
              "",
              f"💳 พร้อมเพย์ {PROMPTPAY}",
              PROMPTPAY_NAME,
              "โอนแล้วส่งสลิปในแชทนี้ได้เลย ขอบคุณ 🙏"]
    return "\n".join(lines)


def messages(room_ids=None):
    """พิมพ์ข้อความบิลจาก context.json (room_ids=None คือทุกห้องที่ไม่มี problems)"""
    with open("context.json", encoding="utf-8") as f:
        ctx = json.load(f)
    for row in ctx["rows"]:
        if row["problems"] or (room_ids is not None and row["room_id"] not in room_ids):
            continue
        print(f"\n===== {row['room']} → {row['tenant']} =====")
        print(bill_message(ctx, row))


def commit(token):
    """เรียกหลังเจ้าของยืนยันแล้วเท่านั้น สร้างบิลแล้วพิมพ์ข้อความบิลของห้องที่สร้างสำเร็จ"""
    with open("payload.json", encoding="utf-8") as f:
        payload = json.load(f)
    if not payload:
        raise RuntimeError("payload ว่าง ไม่มีบิลให้ออก")
    res = call("POST", "/api/bill/bulk", token, {"bills": payload})
    print(res["message"])
    messages({b["roomId"] for b in res.get("bills", [])})
    return res
```

ตัวอย่างการใช้:

```python
from dormy import login, prepare, commit

token = login(EMAIL, PASSWORD)  # ค่าจากแชท ห้าม print
prepare(token, "2026-12-01", {
    "ชั้น2": {"electric": 1234},
    "ชั้น3": {"electric": 15, "electric_wrap": 10000},  # เฉพาะกรณีเจ้าของยืนยันว่ามิเตอร์วนรอบ
    "ชั้น4": {"electric": 1234},
    "ชั้น1 ด้านหลัง": {"electric": 1234},
    "ชั้น1": {"electric": 1234, "discount": 100},
})
# หลังเจ้าของพิมพ์ยืนยันแล้วเท่านั้น (สร้างบิลแล้วพิมพ์ข้อความบิลให้เลย):
# commit(token)

# ถ้าต้องการข้อความบิลชุดเดิมอีกครั้ง (ไม่ต้อง login ไม่ยิง API):
# messages()
```

---

## 6. โหมด B: เมื่อ Claude เรียก API ไม่ได้

ถ้า code execution ออกอินเทอร์เน็ตไม่ได้ (เช่น error เรื่อง network, ไม่อนุญาตโดเมน หรือได้หน้า HTML แทน JSON):
1. ทำขั้นที่ 1–2 ตามปกติ (อ่านเลขและให้เจ้าของยืนยันผลการอ่าน)
2. ส่งผลเป็น JSON ให้เจ้าของคัดลอกไปใช้ต่อ:

   ```json
   {"bill_date": "2026-12-01", "readings": {"ชั้น2": {"electric": 1234}, "ชั้น3": {"electric": 1234}, "ชั้น4": {"electric": 1234}, "ชั้น1 ด้านหลัง": {"electric": 1234}, "ชั้น1": {"electric": 1234}}}
   ```
3. บอกเจ้าของว่าส่ง JSON นี้ให้ Claude Code บนคอมพิวเตอร์ (โปรเจกต์ `C:\dormy`) รันสคริปต์ในหัวข้อ 5 ต่อได้ ซึ่งจะได้ข้อความบิลตามขั้นที่ 7 ด้วย หรือกรอกเลขเองในหน้าเว็บทีละห้อง
4. ห้ามเขียนข้อความบิลให้ผู้เช่าในโหมดนี้ เพราะยังไม่มีเรทค่าไฟ เลขเดือนก่อน และบิลยังไม่ถูกสร้างในระบบ

---

## 7. ข้อห้าม

- ห้ามสร้างบิลโดยไม่ได้คำยืนยันจากเจ้าของในรอบนั้น
- ห้ามแก้หรือลบบิลเดิม คู่มือนี้ใช้สร้างบิลใหม่เท่านั้น
- ห้ามแสดงรหัสผ่านหรือ token ในคำตอบหรือ output ของโค้ด
- ห้ามเดาเลขมิเตอร์หรือห้องที่ไม่แน่ใจ ให้ถามหรือขอรูปใหม่
- ห้ามส่ง `/api/bill/bulk` ซ้ำทั้งชุดหลังเกิด error ให้ตรวจบิลที่มีอยู่ก่อนเสมอ
- ห้ามให้ข้อความบิลกับห้องที่ยังสร้างบิลไม่สำเร็จ และห้ามแต่งตัวเลขในข้อความบิลเอง
