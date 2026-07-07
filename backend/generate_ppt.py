import os
import copy
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def copy_template_shapes(source_slide, target_slide):
    # Copy shapes at index 0 to 7 (background bars, university name, professor name, triangles, logo)
    for i in range(8):
        shape = source_slide.shapes[i]
        el = shape.element
        new_el = copy.deepcopy(el)
        target_slide.shapes._spTree.append(new_el)

def add_content_slide(prs, source_slide, title_text):
    # Add a blank slide
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    
    # Copy the template theme shapes (header, footer, logo, triangles, info)
    copy_template_shapes(source_slide, slide)
    
    # Add title for the content slide in the content area
    title_box = slide.shapes.add_textbox(Inches(0.96), Inches(1.2), Inches(11.4), Inches(0.8))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = "Khmer OS Muol Light"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = RGBColor(15, 23, 42)
    
    return slide

def build_appended_presentation():
    input_path = "/Users/ahzarjy/word doct/MIS.pptx"
    if not os.path.exists(input_path):
        print(f"Error: file not found at {input_path}")
        return

    # Load original presentation with the user's cover slide
    prs = Presentation(input_path)
    
    # Keep only the first slide (which is the user's cover slide)
    # This prevents duplicate slides if the script is run multiple times
    while len(prs.slides) > 1:
        # Delete slide at index 1
        rId = prs.slides._sldIdLst[1].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[1]
    
    cover_slide = prs.slides[0]
    
    # Text fonts
    BODY_FONT = "Kh Battambang"
    TITLE_FONT = "Khmer OS Muol Light"
    
    # Color definition
    DARK_BLUE = RGBColor(30, 41, 59)
    LIGHT_BLUE = RGBColor(14, 165, 233)
    GRAY_TEXT = RGBColor(100, 116, 139)
    WHITE = RGBColor(255, 255, 255)
    LINE_COLOR = RGBColor(99, 102, 241) # Indigo lines

    # -------------------------------------------------------------
    # SLIDE 2: Overview (ស្ថាបត្យកម្ម ៣ ស្រទាប់)
    # -------------------------------------------------------------
    slide2 = add_content_slide(prs, cover_slide, "ស្ថាបត្យកម្ម ៣ ស្រទាប់នៃប្រព័ន្ធ MIS")
    
    content_box2 = slide2.shapes.add_textbox(Inches(0.96), Inches(2.1), Inches(11.4), Inches(4.3))
    tf2 = content_box2.text_frame
    tf2.word_wrap = True
    
    p = tf2.paragraphs[0]
    p.text = "ការបែងចែកសមាសភាគជា ៣ ស្រទាប់ធំៗ៖"
    p.font.name = BODY_FONT
    p.font.size = Pt(15)
    p.font.bold = True
    p.space_after = Pt(10)
    
    p1 = tf2.add_paragraph()
    p1.text = "• ១. Database (ស្រទាប់ផ្ទុកទិន្នន័យ - Data Layer): ជាគ្រឹះមូលដ្ឋានដែលផ្ទុកព័ត៌មាននិងទិន្នន័យអាជីវកម្មទាំងអស់។ (សំខាន់បំផុត)"
    p1.font.name = BODY_FONT
    p1.font.size = Pt(13)
    p1.space_after = Pt(8)
    
    p2 = tf2.add_paragraph()
    p2.text = "• ២. Backend (ស្រទាប់ដំណើរការ Logic - Application Layer): ដំណើរការក្បួនខួរក្បាល និង API សម្របសម្រួលទំនាក់ទំនងរវាង Database និង Frontend។"
    p2.font.name = BODY_FONT
    p2.font.size = Pt(13)
    p2.space_after = Pt(8)
    
    p3 = tf2.add_paragraph()
    p3.text = "• ៣. Frontend (ស្រទាប់បង្ហាញអ្នកប្រើប្រាស់ - Presentation Layer): ចំណុចប្រទាក់ក្រាហ្វិក (UI/UX) សម្រាប់ឱ្យអ្នកប្រើប្រាស់ទូទៅបញ្ជា និងមើលឃើញរបាយការណ៍។"
    p3.font.name = BODY_FONT
    p3.font.size = Pt(13)
    p3.space_after = Pt(18)
    
    p4 = tf2.add_paragraph()
    p4.text = "ចំណាំ៖ Database គឺជាសមាសភាគសំខាន់ដំបូងគេបង្អស់ ព្រោះបើគ្មានទិន្នន័យ នោះប្រព័ន្ធទាំងមូលមិនអាចដំណើរការ ឬមានតម្លៃអ្វីឡើយ។"
    p4.font.name = BODY_FONT
    p4.font.size = Pt(13)
    p4.font.bold = True
    p4.font.color.rgb = LIGHT_BLUE

    # -------------------------------------------------------------
    # SLIDE 3: Priority 1 - Database
    # -------------------------------------------------------------
    slide3 = add_content_slide(prs, cover_slide, "ហេតុអ្វីបានជា Database សំខាន់ជាងគេបង្អស់?")
    
    content_box3 = slide3.shapes.add_textbox(Inches(0.96), Inches(2.1), Inches(11.4), Inches(4.3))
    tf3 = content_box3.text_frame
    tf3.word_wrap = True
    
    points = [
        ("១. ការរក្សាទុកទិន្នន័យពិតប្រាកដ (Data Persistence)",
         "รាល់ប្រវត្តិនៃការលក់ ស្តុកទំនិញ និងគណនីអ្នកប្រើប្រាស់ ត្រូវតែរក្សាទុកជាអចិន្ត្រៃយ៍ ទោះបីជាប្រព័ន្ធបិទ ឬគាំងកុំព្យូទ័រក៏ដោយ។"),
        ("២. ភាពត្រឹមត្រូវ និងសុវត្ថិភាពទិន្នន័យ (Data Integrity & Security)",
         "Database ការពារទិន្នន័យកុំឱ្យស្ទួន ធានាទំនាក់ទំនងរវាងតារាងផ្សេងៗ (Foreign Keys) និងការពារការចូលប្រើប្រាស់ដោយគ្មានការអនុញ្ញាត។"),
        ("៣. ជាប្រភពសម្រាប់ការវិភាគព័ត៌មាន (Business Intelligence)",
         "ទិន្នន័យនៅក្នុង Database គឺជាប្រភពតែមួយគត់សម្រាប់យកមកគណនា វិភាគ និងទាញយកជារបាយការណ៍លក់ ដើម្បីធ្វើការសម្រេចចិត្តអាជីវកម្ម។")
    ]
    
    for idx, (title, desc) in enumerate(points):
        p_t = tf3.add_paragraph() if idx > 0 else tf3.paragraphs[0]
        p_t.text = title
        p_t.font.name = BODY_FONT
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = DARK_BLUE
        
        p_d = tf3.add_paragraph()
        p_d.text = desc
        p_d.font.name = BODY_FONT
        p_d.font.size = Pt(12.5)
        p_d.space_after = Pt(12)

    # -------------------------------------------------------------
    # SLIDE 4: Priority 2 - Backend
    # -------------------------------------------------------------
    slide4 = add_content_slide(prs, cover_slide, "តួនាទីលំដាប់ទីពីរ៖ Backend (ខួរក្បាលនៃប្រព័ន្ធ)")
    
    content_box4 = slide4.shapes.add_textbox(Inches(0.96), Inches(2.1), Inches(11.4), Inches(4.3))
    tf4 = content_box4.text_frame
    tf4.word_wrap = True
    
    p_b1 = tf4.paragraphs[0]
    p_b1.text = "• ដំណើរការក្បួនច្បាប់អាជីវកម្ម (Business Logic)"
    p_b1.font.name = BODY_FONT
    p_b1.font.size = Pt(14)
    p_b1.font.bold = True
    p_b_d1 = tf4.add_paragraph()
    p_b_d1.text = "  - ផ្ទៀងផ្ទាត់ការបញ្ជាទិញ គណនាតម្លៃសរុប ត្រួតពិនិត្យស្តុកទំនិញ និងបញ្ជាទៅកត់ត្រាក្នុង Database។"
    p_b_d1.font.name = BODY_FONT
    p_b_d1.font.size = Pt(12.5)
    p_b_d1.space_after = Pt(10)
    
    p_b2 = tf4.add_paragraph()
    p_b2.text = "• ស្ពានចម្លងទិន្នន័យ (API Gateway)"
    p_b2.font.name = BODY_FONT
    p_b2.font.size = Pt(14)
    p_b2.font.bold = True
    p_b_d2 = tf4.add_paragraph()
    p_b_d2.text = "  - ទទួលសំណើពី Frontend (HTTP Request) រួចទាញយកទិន្នន័យពី Database មកកែច្នៃ និងឆ្លើយតបទៅវិញជាទម្រង់ JSON។"
    p_b_d2.font.name = BODY_FONT
    p_b_d2.font.size = Pt(12.5)
    p_b_d2.space_after = Pt(10)
    
    p_b3 = tf4.add_paragraph()
    p_b3.text = "• សុវត្ថិភាពកម្រិតកម្មវិធី (Application Security)"
    p_b3.font.name = BODY_FONT
    p_b3.font.size = Pt(14)
    p_b3.font.bold = True
    p_b_d3 = tf4.add_paragraph()
    p_b_d3.text = "  - ផ្ទៀងផ្ទាត់អត្តសញ្ញាណអ្នកប្រើប្រាស់ (JWT Authentication) និងកំណត់សិទ្ធិចូលប្រើប្រាស់លើទិន្នន័យនីមួយៗ។"
    p_b_d3.font.name = BODY_FONT
    p_b_d3.font.size = Pt(12.5)

    # -------------------------------------------------------------
    # SLIDE 5: Priority 3 - Frontend
    # -------------------------------------------------------------
    slide5 = add_content_slide(prs, cover_slide, "តួនាទីលំដាប់ចុងក្រោយ៖ Frontend (មុខមាត់ប្រព័ន្ធ)")
    
    content_box5 = slide5.shapes.add_textbox(Inches(0.96), Inches(2.1), Inches(11.4), Inches(4.3))
    tf5 = content_box5.text_frame
    tf5.word_wrap = True
    
    p_f1 = tf5.paragraphs[0]
    p_f1.text = "• ចំណុចប្រទាក់អ្នកប្រើប្រាស់ (User Interface - UI)"
    p_f1.font.name = BODY_FONT
    p_f1.font.size = Pt(14)
    p_f1.font.bold = True
    p_f_d1 = tf5.add_paragraph()
    p_f_d1.text = "  - បង្ហាញទិន្នន័យពី Database ក្នុងទម្រង់ដែលងាយស្រួលមើល ដូចជាតារាង ពណ៌ ក្រាហ្វិក និងប៊ូតុងបញ្ជាផ្សេងៗ។"
    p_f_d1.font.name = BODY_FONT
    p_f_d1.font.size = Pt(12.5)
    p_f_d1.space_after = Pt(10)

    p_f2 = tf5.add_paragraph()
    p_f2.text = "• បទពិសោធន៍អ្នកប្រើប្រាស់ (User Experience - UX)"
    p_f2.font.name = BODY_FONT
    p_f2.font.size = Pt(14)
    p_f2.font.bold = True
    p_f_d2 = tf5.add_paragraph()
    p_f_d2.text = "  - ធានាការរៀបចំទម្រង់ការងារឱ្យមានភាពងាយស្រួល រហ័ស និងមានរបៀបរៀបរយសម្រាប់អ្នកប្រើប្រាស់ទូទៅ។"
    p_f_d2.font.name = BODY_FONT
    p_f_d2.font.size = Pt(12.5)
    p_f_d2.space_after = Pt(10)

    p_f3 = tf5.add_paragraph()
    p_f3.text = "• ការប្រមូលទិន្នន័យបញ្ចូលដំបូង (Input Collection)"
    p_f3.font.name = BODY_FONT
    p_f3.font.size = Pt(14)
    p_f3.font.bold = True
    p_f_d3 = tf5.add_paragraph()
    p_f_d3.text = "  - ទទួលការបញ្ចូលព័ត៌មានពីអ្នកប្រើប្រាស់ (ដូចជាការកត់ត្រាការលក់ថ្មី ឬបន្ថែមទំនិញ) រួចផ្ញើវាទៅកាន់ Backend។"
    p_f_d3.font.name = BODY_FONT
    p_f_d3.font.size = Pt(12.5)

    # -------------------------------------------------------------
    # SLIDE 6: Database Schema / Tables
    # -------------------------------------------------------------
    slide6 = add_content_slide(prs, cover_slide, "ស្ថាបត្យកម្មតារាងទិន្នន័យ (Database Tables)")
    
    content_box6 = slide6.shapes.add_textbox(Inches(0.96), Inches(2.1), Inches(11.4), Inches(4.3))
    tf6 = content_box6.text_frame
    tf6.word_wrap = True
    
    p_sch = tf6.paragraphs[0]
    p_sch.text = "តារាងសំខាន់ៗទាំង ៦ នៅក្នុងប្រព័ន្ធ Sales MIS Database៖"
    p_sch.font.name = BODY_FONT
    p_sch.font.size = Pt(14)
    p_sch.font.bold = True
    p_sch.space_after = Pt(10)
    
    sch_items = [
        ("• users", "រក្សាទុកគណនីបុគ្គលិក អ៊ីមែល លេខសម្ងាត់ និងសិទ្ធិគ្រប់គ្រង (Admin / User)។"),
        ("• customers", "ប្រមូលព័ត៌មានទំនាក់ទំនងរបស់ក្រុមហ៊ុន ឬអតិថិជន និងក្រុមចំណាត់ថ្នាក់ (VIP, Active, Wholesale)។"),
        ("• products", "បញ្ជីទំនិញ កូដ (SKU) តម្លៃលក់ ចំនួនស្តុកសរុប និងកម្រិតស្តុកកំណត់ត្រូវបញ្ជាទិញបន្ថែម (Reorder Level)។"),
        ("• orders", "កត់ត្រាលេខវិក្កយបត្រ កាលបរិច្ឆេទលក់ ស្ថានភាពបញ្ជាទិញ (Pending, Completed, Delayed) និងតម្លៃសរុប។"),
        ("• order_items", "ផ្ទុកព័ត៌មានលម្អិតនៃទំនិញលក់ចេញក្នុងវិក្កយបត្រនីមួយៗ (ចំនួនលក់ តម្លៃឯកតា និងតម្លៃសរុបជួរ)។"),
        ("• inventory_movements", "ប្រវត្តិនៃការបម្រែបម្រួលស្តុកទាំងអស់សម្រាប់ធ្វើសវនកម្ម (Audit Log) ដូចជាការលក់ចេញ ឬការបន្ថែមស្តុកដំបូង។")
    ]
    
    for item_title, item_desc in sch_items:
        p_item = tf6.add_paragraph()
        p_item.text = f"{item_title}: {item_desc}"
        p_item.font.name = BODY_FONT
        p_item.font.size = Pt(12)
        p_item.space_after = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 7: Database Workflow Step-by-Step
    # -------------------------------------------------------------
    slide7 = add_content_slide(prs, cover_slide, "លំហូរការងារទិន្នន័យ៖ ដំណើរការលក់ (Sales Workflow)")
    
    content_box7 = slide7.shapes.add_textbox(Inches(0.96), Inches(2.1), Inches(11.4), Inches(4.3))
    tf7 = content_box7.text_frame
    tf7.word_wrap = True
    
    p_flow = tf7.paragraphs[0]
    p_flow.text = "សង្វាក់ការងាររៀបចំដោយប្រព័ន្ធ Database តាមជំហាននីមួយៗ៖"
    p_flow.font.name = BODY_FONT
    p_flow.font.size = Pt(14)
    p_flow.font.bold = True
    p_flow.space_after = Pt(10)
    
    steps = [
        ("ជំហានទី ១: បង្កើតប្រតិបត្តិការលក់ (Create Order)",
         "បង្កើតជួរទិន្នន័យថ្មីមួយក្នុងតារាង `orders` ភ្ជាប់ទៅ `customers.id` និងកំណត់ស្ថានភាព 'Pending'។"),
        ("ជំហានទី ២: បញ្ចូលបញ្ជីទំនិញលម្អិត (Insert Line Items)",
         "រាល់ទំនិញដែលបានទិញ ត្រូវបញ្ចូលទៅក្នុងតារាង `order_items` ភ្ជាប់ទៅកាន់ `orders.id` និង `products.id` នីមួយៗ។"),
        ("ជំហានទី ៣: ធ្វើបច្ចុប្បន្នភាពកម្រិតស្តុក (Update Product Stock)",
         "ចំនួនស្តុកក្នុងតារាង `products` ត្រូវបានដកចេញទៅតាមចំនួនទំនិញដែលបានលក់ចេញនីមួយៗ។"),
        ("ជំហានទី ៤: បង្កើតកំណត់ត្រាសវនកម្មស្តុក (Audit Inventory)",
         "បង្កើតកំណត់ត្រាថ្មីមួយក្នុងតារាង `inventory_movements` ប្រភេទ 'SALE' និងចំនួនដក (-) ដើម្បីជាភស្តុតាងសវនកម្ម (Audit Log)។")
    ]
    
    for idx, (title, desc) in enumerate(steps):
        p_s = tf7.add_paragraph()
        p_s.text = f"{title}"
        p_s.font.name = BODY_FONT
        p_s.font.size = Pt(13)
        p_s.font.bold = True
        p_s.font.color.rgb = DARK_BLUE
        
        p_sd = tf7.add_paragraph()
        p_sd.text = f"  - {desc}"
        p_sd.font.name = BODY_FONT
        p_sd.font.size = Pt(12)
        p_sd.space_after = Pt(8)

    # -------------------------------------------------------------
    # SLIDE 8: Entity-Relationship Diagram (ER Diagram) - NEW
    # -------------------------------------------------------------
    slide8 = add_content_slide(prs, cover_slide, "ឌីយ៉ាក្រាមទំនាក់ទំនងទិន្នន័យ (Entity-Relationship Diagram)")
    
    # 1. users table shape
    box_users = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(2.2), Inches(2.2), Inches(1.5))
    box_users.fill.solid()
    box_users.fill.fore_color.rgb = WHITE
    box_users.line.color.rgb = LINE_COLOR
    tf_u = box_users.text_frame
    tf_u.word_wrap = True
    p = tf_u.paragraphs[0]
    p.text = "users"
    p.font.name = TITLE_FONT
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = DARK_BLUE
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(4)
    for field in ["id (PK)", "email", "full_name", "is_admin"]:
        p_f = tf_u.add_paragraph()
        p_f.text = field
        p_f.font.name = BODY_FONT
        p_f.font.size = Pt(9.5)
        p_f.font.color.rgb = GRAY_TEXT

    # 2. customers table shape
    box_cust = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.3), Inches(2.2), Inches(1.5))
    box_cust.fill.solid()
    box_cust.fill.fore_color.rgb = WHITE
    box_cust.line.color.rgb = LINE_COLOR
    tf_c = box_cust.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = "customers"
    p.font.name = TITLE_FONT
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = DARK_BLUE
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(4)
    for field in ["id (PK)", "customer_code", "name", "email", "segment"]:
        p_f = tf_c.add_paragraph()
        p_f.text = field
        p_f.font.name = BODY_FONT
        p_f.font.size = Pt(9.5)
        p_f.font.color.rgb = GRAY_TEXT

    # 3. inventory_movements table shape (Middle Top)
    box_inv = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.8), Inches(2.2), Inches(2.7), Inches(1.5))
    box_inv.fill.solid()
    box_inv.fill.fore_color.rgb = WHITE
    box_inv.line.color.rgb = LINE_COLOR
    tf_i = box_inv.text_frame
    tf_i.word_wrap = True
    p = tf_i.paragraphs[0]
    p.text = "inventory_movements"
    p.font.name = TITLE_FONT
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = DARK_BLUE
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(4)
    for field in ["id (PK)", "product_id (FK)", "movement_type", "quantity", "created_by (FK)"]:
        p_f = tf_i.add_paragraph()
        p_f.text = field
        p_f.font.name = BODY_FONT
        p_f.font.size = Pt(9.5)
        p_f.font.color.rgb = GRAY_TEXT

    # 4. orders table shape (Middle Bottom)
    box_ord = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.8), Inches(4.3), Inches(2.7), Inches(1.5))
    box_ord.fill.solid()
    box_ord.fill.fore_color.rgb = WHITE
    box_ord.line.color.rgb = LINE_COLOR
    tf_o = box_ord.text_frame
    tf_o.word_wrap = True
    p = tf_o.paragraphs[0]
    p.text = "orders"
    p.font.name = TITLE_FONT
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = DARK_BLUE
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(4)
    for field in ["id (PK)", "order_number", "customer_id (FK)", "total", "ordered_at"]:
        p_f = tf_o.add_paragraph()
        p_f.text = field
        p_f.font.name = BODY_FONT
        p_f.font.size = Pt(9.5)
        p_f.font.color.rgb = GRAY_TEXT

    # 5. products table shape (Right Top)
    box_prod = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.9), Inches(2.2), Inches(2.2), Inches(1.5))
    box_prod.fill.solid()
    box_prod.fill.fore_color.rgb = WHITE
    box_prod.line.color.rgb = LINE_COLOR
    tf_p = box_prod.text_frame
    tf_p.word_wrap = True
    p = tf_p.paragraphs[0]
    p.text = "products"
    p.font.name = TITLE_FONT
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = DARK_BLUE
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(4)
    for field in ["id (PK)", "product_code", "sku", "name", "price", "stock"]:
        p_f = tf_p.add_paragraph()
        p_f.text = field
        p_f.font.name = BODY_FONT
        p_f.font.size = Pt(9.5)
        p_f.font.color.rgb = GRAY_TEXT

    # 6. order_items table shape (Right Bottom)
    box_items = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.9), Inches(4.3), Inches(2.2), Inches(1.5))
    box_items.fill.solid()
    box_items.fill.fore_color.rgb = WHITE
    box_items.line.color.rgb = LINE_COLOR
    tf_it = box_items.text_frame
    tf_it.word_wrap = True
    p = tf_it.paragraphs[0]
    p.text = "order_items"
    p.font.name = TITLE_FONT
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = DARK_BLUE
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(4)
    for field in ["id (PK)", "order_id (FK)", "product_id (FK)", "quantity", "unit_price"]:
        p_f = tf_it.add_paragraph()
        p_f.text = field
        p_f.font.name = BODY_FONT
        p_f.font.size = Pt(9.5)
        p_f.font.color.rgb = GRAY_TEXT

    # Drawing connector lines between tables
    # 1. users -> inventory_movements (Horiz)
    line1 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(3.4), Inches(2.95), Inches(1.4), Inches(0.02))
    line1.fill.solid()
    line1.fill.fore_color.rgb = LINE_COLOR
    line1.line.fill.background()

    # 2. customers -> orders (Horiz)
    line2 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(3.4), Inches(5.05), Inches(1.4), Inches(0.02))
    line2.fill.solid()
    line2.fill.fore_color.rgb = LINE_COLOR
    line2.line.fill.background()

    # 3. products -> inventory_movements (Horiz)
    line3 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.5), Inches(2.95), Inches(1.4), Inches(0.02))
    line3.fill.solid()
    line3.fill.fore_color.rgb = LINE_COLOR
    line3.line.fill.background()

    # 4. products -> order_items (Vert)
    line4 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(10.0), Inches(3.7), Inches(0.02), Inches(0.6))
    line4.fill.solid()
    line4.fill.fore_color.rgb = LINE_COLOR
    line4.line.fill.background()

    # 5. orders -> order_items (Horiz)
    line5 = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.5), Inches(5.05), Inches(1.4), Inches(0.02))
    line5.fill.solid()
    line5.fill.fore_color.rgb = LINE_COLOR
    line5.line.fill.background()

    # Note text box for explanations
    note_box = slide8.shapes.add_textbox(Inches(1.2), Inches(6.0), Inches(9.9), Inches(0.5))
    note_tf = note_box.text_frame
    note_tf.word_wrap = True
    note_p = note_tf.paragraphs[0]
    note_p.text = "ទំនាក់ទំនងរវាងតារាង (Relationships)៖\n• PK: Primary Key (សោចម្បង) | FK: Foreign Key (សោក្រៅដែលភ្ជាប់ទំនាក់ទំនងរវាងតារាងមួយទៅតារាងមួយទៀត)"
    note_p.font.name = BODY_FONT
    note_p.font.size = Pt(11)
    note_p.font.color.rgb = GRAY_TEXT

    # -------------------------------------------------------------
    # SLIDE 9: Conclusion
    # -------------------------------------------------------------
    slide9 = add_content_slide(prs, cover_slide, "សន្និដ្ឋានរួម (Conclusion)")
    
    content_box9 = slide9.shapes.add_textbox(Inches(0.96), Inches(2.1), Inches(11.4), Inches(4.3))
    tf9 = content_box9.text_frame
    tf9.word_wrap = True
    
    p_c1 = tf9.paragraphs[0]
    p_c1.text = "• Database (មូលដ្ឋានទិន្នន័យ) គឺជា គ្រឹះស្ថាន (Foundation) ដ៏រឹងមាំ ដែលរក្សាទុកព័ត៌មាននិងទ្រព្យសម្បត្តិស្នូល។"
    p_c1.font.name = BODY_FONT
    p_c1.font.size = Pt(14)
    p_c1.space_after = Pt(12)

    p_c2 = tf9.add_paragraph()
    p_c2.text = "• Backend (ប្រព័ន្ធដំណើរការខាងក្រោយ) គឺជា ម៉ាស៊ីន (Engine) ដ៏មានថាមពល ដែលគណនា និងចម្លងទិន្នន័យទៅមក។"
    p_c2.font.name = BODY_FONT
    p_c2.font.size = Pt(14)
    p_c2.space_after = Pt(12)

    p_c3 = tf9.add_paragraph()
    p_c3.text = "• Frontend (ចំណុចប្រទាក់ខាងមុខ) គឺជា មុខមាត់ (Interface) ដ៏ស្រស់ស្អាត ដែលជួយឱ្យមនុស្សងាយស្រួលធ្វើការជាមួយប្រព័ន្ធ។"
    p_c3.font.name = BODY_FONT
    p_c3.font.size = Pt(14)
    p_c3.space_after = Pt(20)

    p_c4 = tf9.add_paragraph()
    p_c4.text = "ការរួមបញ្ចូលគ្នាយ៉ាងល្អឥតខ្ចោះរវាងសមាសភាគទាំងបីនេះ នឹងបង្កើតបានជាប្រព័ន្ធ MIS មួយដ៏ជោគជ័យ និងមានប្រសិទ្ធភាពខ្ពស់សម្រាប់អាជីវកម្ម។"
    p_c4.font.name = BODY_FONT
    p_c4.font.size = Pt(14.5)
    p_c4.font.bold = True
    p_c4.font.color.rgb = LIGHT_BLUE
    p_c4.alignment = PP_ALIGN.CENTER

    # Save back to the user's original presentation location
    prs.save(input_path)
    print(f"Successfully appended slides to original presentation at: {input_path}")

if __name__ == "__main__":
    build_appended_presentation()
