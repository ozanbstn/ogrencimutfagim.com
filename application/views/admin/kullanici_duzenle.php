
    <div class="content">
        <div class="header">
            <div class="stats">
    <p class="stat"><span class="label label-info">5</span> Tickets</p>
    <p class="stat"><span class="label label-success">27</span> Tasks</p>
    <p class="stat"><span class="label label-danger">15</span> Overdue</p>
</div>

            <h1 class="page-title">Kullanıcı Düzenleme</h1>
                    <ul class="breadcrumb">
            <li><a href="index.html">Anasayfa</a> </li>
            <li class="active">Kullanıcı Düzemleme</li>
        </ul>

        </div>
        <div class="main-content">
            
			<!-- BU ALAN ORTA ALANDIR -->
			
<div class="row">
  <div class="col-md-4">
    <br>
    <div id="myTabContent" class="tab-content">
   
      <form action="<?=base_url()?>admin/kullanicilar/guncelle/<?=$veri[0]->id?>" method="POST">
        <div class="form-group">
        <label>Adı</label>
        <input type="text" name="adi" value="<?=$veri[0]->adi?>" class="form-control">
        </div>
		<div class="form-group">
        <label>Soyadı</label>
        <input type="text" name="soyadi" value="<?=$veri[0]->soyadi?>" class="form-control">
        </div>
        <div class="form-group">
        <label>Email</label>
        <input type="text" name="email" value="<?=$veri[0]->email?>" class="form-control">
        </div>
      <div class="form-group">
        <label>Şifre</label>
        <input type="text" name="sifre" value="<?=$veri[0]->sifre?>" class="form-control">
        </div>
	  <div class="form-group">
        <label>Yetki</label>
        <input type="text" name="yetki" value="<?=$veri[0]->yetki?>" class="form-control">
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

