# النشر التلقائي على cPanel

الملف `.github/workflows/deploy.yml` ينشر الموقع مع كل push على `main`، ويمكن تشغيله يدويًا من تبويب Actions. لا يحتاج الموقع خطوة build.

## 1. إعداد حساب FTP

من cPanel افتح **FTP Accounts** وأنشئ حسابًا مخصصًا للنشر. اضبط **Directory** على مجلد الموقع الحالي `public_html`، وليس مجلدًا جديدًا داخله. استخدم كلمة مرور قوية واحتفظ بها.

افتح **Configure FTP Client** للحساب وخذ اسم السيرفر واسم المستخدم الكامل. تأكد أن الاستضافة تدعم **Explicit FTPS** على المنفذ **21**؛ هذا مختلف عن SFTP على المنفذ 22.

## 2. إضافة GitHub Secrets

افتح https://github.com/ahmedbhaa22/src/settings/secrets/actions ثم **New repository secret** وأضف كل اسم على حدة:

| Name | Secret |
| --- | --- |
| `FTP_SERVER` | اسم سيرفر FTP من الاستضافة، بدون `ftp://` أو مسار |
| `FTP_USERNAME` | اسم مستخدم FTP كاملًا كما يظهر في cPanel |
| `FTP_PASSWORD` | كلمة مرور حساب FTP |
| `FTP_SERVER_DIR` | `/` إذا كان حساب FTP مقيدًا أصلًا داخل `public_html`؛ أو `/public_html/` إذا كان يبدأ من المجلد الرئيسي للحساب |

المسار يجب أن ينتهي بـ `/`. تأكد من المسار عبر عميل FTP: المجلد المقصود هو الذي يحتوي على `index.html` الخاص بالموقع الحالي. لا تضف `public_html` مرة ثانية إذا كان حساب FTP يبدأ داخله بالفعل. لا تضع كلمات المرور في ملفات المشروع أو في المحادثة.

## 3. رفع إعداد النشر

ارفع هذين الملفين فقط أولًا إلى `main`:

```powershell
git add .github/workflows/deploy.yml DEPLOYMENT.md
git commit -m "Add automatic cPanel deployment"
git push origin main
```

هذه الأوامر لا تضم تعديلات الموقع الأخرى الموجودة محليًا. الأكشن ينشر الملفات الموجودة في commit على GitHub؛ أي تعديلات جديدة في الموقع تحتاج commit وpush أيضًا.

## 4. التأكد من أول تشغيل

افتح https://github.com/ahmedbhaa22/src/actions ثم **Deploy website to cPanel** وتابع التشغيل حتى تظهر علامة نجاح خضراء. بعد النجاح افتح الموقع واعمل تحديثًا قويًا بـ **Ctrl+F5**.

لإعادة التشغيل بعد ضبط Secrets: **Actions → Deploy website to cPanel → Run workflow → main → Run workflow**.

## الملفات المنشورة

يُنشر HTML الموجود في جذر المشروع ومجلدات `assets` و`css` و`js`، ومعها `.htaccess` و`robots.txt` و`sitemap.xml` و`favicon.ico` إن وجدت. لا تنشر ملفات ZIP أو مجلد `_recovery` أو مستندات الإعداد أو `firestore.rules`؛ قواعد Firestore تُنشر منفصلة عبر Firebase.

الأكشن لا يمسح مجلد الاستضافة بالكامل. يزامن الملفات التي يديرها، ويستطيع حذف ملف سبق نشره من خلاله إذا أُزيل من المشروع. الملفات القديمة التي رُفعت يدويًا لا تُحذف تلقائيًا في أول تشغيل.

إذا فشل الاتصال، راجع السيرفر واسم المستخدم ودعم FTPS والمنفذ 21 مع شركة الاستضافة. وإذا نجح الرفع ولم يتغير الموقع، راجع `FTP_SERVER_DIR` والكاش.

## فورم طلب الباكدج (الإيميل)

زرار Get Started بيبعت الطلب لـ `api/lead.php`، وهو اللي بيبعت الإيميل عن طريق SMTP.
وزرار Get a Call (في أول الصفحة وفي الـ Nav) بيبعت الاسم الأول والأخير والإيميل والتليفون لنفس الملف، والإيميل بيوصل بعنوان `Call request: الاسم`.
إعدادات الإيميل مش موجودة في الكود. الـ deploy بيكتبها على السيرفر بس في `api/config.php` من الـ Secrets دي:

| Secret | مثال |
|---|---|
| `SMTP_HOST` | mail.solidreachco.com |
| `SMTP_PORT` | 465 (SSL) أو 587 (STARTTLS) |
| `SMTP_USER` | الإيميل اللي بيبعت |
| `SMTP_PASS` | الباسورد بتاعه |
| `SMTP_FROM` | اختياري، لو عايز From مختلف عن SMTP_USER |
| `LEAD_TO` | الإيميل اللي الطلبات توصله |

لو الـ Secrets دي مش موجودة، الفورم بيفتح برنامج الإيميل عند الزائر بالطلب جاهز بدل ما يبعته.
بعد ما تضيفها أو تغيّرها، شغّل الـ workflow تاني من Actions > Deploy website to cPanel > Run workflow.

الحماية: POST بس ومن solidreachco.com بس، تحقق من كل حقل، honeypot وفحص وقت للبوتات،
وحد أقصى 5 طلبات في الساعة و15 في اليوم لكل IP و200 في اليوم للموقع كله.
