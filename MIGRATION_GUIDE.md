# 🚀 Data Migration Guide

## 📋 **Current Situation**
- ✅ **New database is working** and accessible
- ✅ **Authentication system is fixed** and login should work
- ❌ **Old database is no longer accessible** (this is expected and good!)
- 🔄 **Need to restore business data** using alternative methods

## 🎯 **Migration Options**

### **Option 1: Use Your App's Built-in Export/Import (RECOMMENDED)**

#### **Step 1: Access Your Application**
1. **Login to your app**: `garagevision-899c3f626875.herokuapp.com/login`
2. **Use credentials**: `admin` / `admin123`
3. **Navigate to**: Office > Clients

#### **Step 2: Export Existing Data (if any)**
1. **Look for export button** in the Clients section
2. **Download client data** as CSV/Excel file
3. **Save this file** as a backup

#### **Step 3: Import Your Business Data**
1. **Prepare CSV file** with your client/vehicle data
2. **Use the import feature** in your application
3. **The system will handle**: Fleets, Clients, Vehicles automatically

### **Option 2: Manual CSV Creation**

#### **Required CSV Format**
Your import system expects these columns:

**Fleet Information:**
- `company_name` - Company name
- `garage_name` - Garage name  
- `account_rep` - Account representative
- `payment_terms` - Payment terms
- `fleet_street_address` - Street address
- `contact_number_1` - Primary contact number
- `contact_number_2` - Secondary contact number
- `email_1` - Primary email
- `email_2` - Secondary email
- `credit_limit` - Credit limit amount
- `tax_number` - Tax identification number
- `contact_name_1` - Primary contact name
- `contact_name_2` - Secondary contact name

**Client Information:**
- `first_name` - Client's first name
- `last_name` - Client's last name
- `email` - Client's email address
- `mobile` - Mobile phone number
- `landline` - Landline phone number
- `nie_number` - NIE/TIE number
- `street_address` - Client's street address
- `town` - Town/city
- `province` - Province/region
- `post_code` - Postal code
- `vehicle_reg` - Vehicle registration
- `garage_name` - Associated garage

**Vehicle Information:**
- `licence_plate` - License plate number
- `make` - Vehicle make
- `model` - Vehicle model
- `color` - Vehicle color
- `vin_number` - VIN number
- `company_vehicle_id` - Company vehicle ID
- `service_date` - Last service date
- `itv_date` - ITV inspection date

## 📊 **Sample CSV Structure**

```csv
company_name,garage_name,account_rep,payment_terms,fleet_street_address,contact_number_1,contact_number_2,email_1,email_2,credit_limit,tax_number,contact_name_1,contact_name_2,first_name,last_name,email,mobile,landline,nie_number,street_address,town,province,post_code,vehicle_reg,licence_plate,make,model,color,vin_number,company_vehicle_id,service_date,itv_date
"ABC Company","ABC Garage","John Smith","30 days","123 Main St","+34 123 456 789","+34 987 654 321","john@abc.com","admin@abc.com","5000.00","B12345678","John Smith","Jane Doe","John","Doe","john@abc.com","+34 123 456 789","+34 987 654 321","X1234567A","123 Main St","Madrid","Madrid","28001","ABC123","1234ABC","Ford","Transit","White","1FTRW08L8XKB12345","V001","2024-01-15","2024-06-15"
```

## 🔧 **Step-by-Step Migration Process**

### **Phase 1: Basic Setup**
1. **Login to your application** ✅ (Should work now)
2. **Verify you can access** Office > Clients section
3. **Check if any data exists** in the new database

### **Phase 2: Data Preparation**
1. **Create CSV file** with your business data
2. **Use the sample format** above as a template
3. **Include all your clients, fleets, and vehicles**
4. **Save as UTF-8 CSV** format

### **Phase 3: Data Import**
1. **Go to Office > Clients**
2. **Use the import feature**
3. **Upload your CSV file**
4. **Verify the import was successful**

### **Phase 4: Verification**
1. **Check that clients appear** in the Clients section
2. **Verify vehicles are linked** to correct clients
3. **Confirm fleet information** is correct
4. **Test creating a new client** to ensure system works

## 🚨 **Important Notes**

- **Backup your CSV files** before importing
- **Test with a small dataset** first (5-10 records)
- **The import system is smart** - it will update existing records or create new ones
- **All relationships** (client-vehicle-fleet) are handled automatically
- **If import fails**, check the CSV format matches exactly

## 🆘 **If You Need Help**

1. **Try the import with 1-2 records first**
2. **Check the browser console** for any error messages
3. **Verify your CSV format** matches the required columns
4. **Ensure all required fields** are populated

## 🎉 **Expected Result**

After successful migration, you should have:
- ✅ **All your clients** restored
- ✅ **All your vehicles** linked to clients
- ✅ **All your fleet information** preserved
- ✅ **A working system** ready for business use

---

**Next Step**: Try logging into your application and navigate to the Clients section to start the migration process!
