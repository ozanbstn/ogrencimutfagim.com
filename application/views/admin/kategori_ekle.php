
    <div class="content">
        <div class="header">
            <div class="stats">
    <p class="stat"><span class="label label-info">5</span> Tickets</p>
    <p class="stat"><span class="label label-success">27</span> Tasks</p>
    <p class="stat"><span class="label label-danger">15</span> Overdue</p>
</div>

            <h1 class="page-title">Kategori Ekleme</h1>
                    <ul class="breadcrumb">
            <li><a href="index.html">Anasayfa</a> </li>
            <li class="active">Kategori Ekleme</li>
        </ul>

        </div>
        <div class="main-content">
            
			<!-- BU ALAN ORTA ALANDIR -->
			
<div class="rows">
  <div class="col-md-10">
    <br>
    <div id="myTabContent" class="tab-content">
   
      <form action="<?=base_url()?>admin/kategoriler/kaydet" method="POST">
        <div class="form-group">
        <label>Kategori Adı</label>
        <input type="text" name="adi" class="form-control">
        </div>
        <div class="form-group">
          <label>Açıklama</label>
          <textarea name="aciklama" rows="3" class="form-control">
		  </textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'aciklama' );
            </script>
			
        </div>
        <div class="form-group">
          <label>Keywords</label>
          <textarea name="keywords" rows="3" class="form-control">
		  </textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'keywords' );
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