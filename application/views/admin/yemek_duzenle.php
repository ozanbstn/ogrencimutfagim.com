
    <div class="content">
        <div class="header">
            <div class="stats">
    <p class="stat"><span class="label label-info">5</span> Tickets</p>
    <p class="stat"><span class="label label-success">27</span> Tasks</p>
    <p class="stat"><span class="label label-danger">15</span> Overdue</p>
</div>

            <h1 class="page-title">Tarif Düzenleme</h1>
                    <ul class="breadcrumb">
            <li><a href="index.html">Anasayfa</a> </li>
            <li class="active">Tarif Düzemleme</li>
        </ul>

        </div>
        <div class="main-content">
            
			<!-- BU ALAN ORTA ALANDIR -->
			
<div class="row">
  <div class="col-md-10">
    <br>
    <div id="myTabContent" class="tab-content">
   
      <form action="<?=base_url()?>admin/yemekler/guncelle/<?=$veri[0]->id?>" method="POST">
        <div class="form-group">
        <label>Yemek Adı</label>
        <input type="text" name="adi" value="<?=$veri[0]->adi?>" class="form-control">
        </div>
		<div class="form-group">
            <label>Yemek Türü</label>
            <select name="kategori_id" class="form-control">
			<option selected value="<?=$veri[0]->kategori_id?>"><?=$veri[0]->katadi?></option>
             <?php
			 foreach($kategoriler as $rs)
			 { ?>
<option value="<?=$rs->Id?>"><?=$rs->adi?></option>
               <?php 
			 }
			   ?>  			 
            </select>
          </div>
        <div class="form-group">
          <label>Malzemeler</label>
          <textarea name="malzemeler" rows="4" class="form-control"><?=$veri[0]->malzemeler?></textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'malzemeler' );
            </script>
        </div>
        <div class="form-group">
          <label>Tarif:</label>
          <textarea name="tarif" rows="4" class="form-control"><?=$veri[0]->tarif?></textarea><script>
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

