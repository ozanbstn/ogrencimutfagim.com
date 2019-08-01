
    <div class="content">
        <div class="header">
            <div class="stats">
    <p class="stat"><span class="label label-info">5</span> Tickets</p>
    <p class="stat"><span class="label label-success">27</span> Tasks</p>
    <p class="stat"><span class="label label-danger">15</span> Overdue</p>
</div>

            <h1 class="page-title">Tarif Ekleme</h1>
                    <ul class="breadcrumb">
            <li><a href="index.html">Anasayfa</a> </li>
            <li class="active">Tarif Ekleme</li>
        </ul>

        </div>
        <div class="main-content">
            
			<!-- BU ALAN ORTA ALANDIR -->
			
<div class="rows">
  <div class="col-md-10">
    <br>
    <div id="myTabContent" class="tab-content">
   
      <form action="<?=base_url()?>admin/yemekler/kaydet" method="POST">
        <div class="form-group">
        <label>Yemek Adı</label>
        <input type="text" name="adi" class="form-control">
        </div>
		<div class="form-group">
            <label>Yemek Türü</label>
            <select name="kategori_id" class="form-control">
             <?php
			 foreach($veri as $rs)
			 { ?>
                <option value="<?=$rs->Id?>"><?=$rs->adi?></option>
               <?php 
			 }
			   ?>  				  
            </select>
          </div>
        <div class="form-group">
          <label>Malzemeler</label>
          <textarea name="malzemeler" rows="3" class="form-control">
		  </textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'malzemeler' );
            </script>
			
        </div>
        <div class="form-group">
          <label>Tarif:</label>
          <textarea name="tarif" rows="3" class="form-control">
		  </textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'tarif' );
            </script>
        </div>  
 </div>

    <div class="btn-toolbar list-toolbar">
      <button class="btn btn-primary"><i class="fa fa-save"></i> Kaydet</button>
	</div>
	</form>
  </div>
</div>

<!-- BITIS -->
</div>
</div>
</div>
</div>