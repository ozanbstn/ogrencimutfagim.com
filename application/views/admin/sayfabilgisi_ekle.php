
    <div class="content">
        <div class="header">
            <div class="stats">
    <p class="stat"><span class="label label-info">5</span> Tickets</p>
    <p class="stat"><span class="label label-success">27</span> Tasks</p>
    <p class="stat"><span class="label label-danger">15</span> Overdue</p>
</div>

            <h1 class="page-title">Sayfa Bilgisi</h1>
                    <ul class="breadcrumb">
            <li><a href="index.html">Anasayfa</a> </li>
            <li class="active">Sayfa Bilgisi Ayarları</li>
        </ul>

        </div>
        <div class="main-content">
            
			<!-- BU ALAN ORTA ALANDIR -->
<div class="row">
  <div class="col-md-10">
    <br>
    <div id="myTabContent" class="tab-content">
   
      <form action="<?=base_url()?>admin/home/sayfabilgisi_guncelle/<?=$veri[0]->Id?>" method="POST">
        <div class="form-group">
        <div class="form-group">
        <label>Sayfa Başlığı:</label>
        <input type="text" name="title" value="<?=$veri[0]->title?>" class="form-control">
        </div>
        <div class="form-group">
          <label>Açıklama:</label>
          <textarea name="kisaaciklama" rows="4" class="form-control"><?=$veri[0]->kisaaciklama?></textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'kisaaciklama' );
            </script>
        </div>
		<div class="form-group">
          <label>Hakkımızda</label>
          <textarea name="hakkimizda" rows="4" class="form-control"><?=$veri[0]->hakkimizda?></textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'hakkimizda' );
            </script>
        </div>
		<div class="form-group">
          <label>İletişim</label>
          <textarea name="iletisim" rows="4" class="form-control"><?=$veri[0]->iletisim?></textarea><script>
                // Replace the <textarea id="editor1"> with a CKEditor
                // instance, using default configuration.
                CKEDITOR.replace( 'iletisim' );
            </script>
        </div>
		<div class="form-group">
        <label>Email</label>
        <input type="text" name="email" value="<?=$veri[0]->email?>"class="form-control">
        </div>
		<div class="form-group">
          <label>Keywords</label>
          <textarea name="keywords" rows="4" class="form-control"><?=$veri[0]->keywords?></textarea><script>
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
