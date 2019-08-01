
    <div class="content">
        <div class="header">
            <div class="stats">
    <p class="stat"><span class="label label-info">5</span> Tickets</p>
    <p class="stat"><span class="label label-success">27</span> Tasks</p>
    <p class="stat"><span class="label label-danger">15</span> Overdue</p>
</div>

            <h1>Yeni Kullanıcı Ekleme</h1>
                    <ul class="breadcrumb">
            <li><a href="index.html">Anasayfa</a> </li>
            <li class="active">Yeni Kullanıcı Ekleme</li>
        </ul>

        </div>
        <div class="main-content">
     
	<div class="box-content">

            <?php
            echo form_open_multipart(base_url().'admin/Yemekler/do_upload/'.$veri[0]->id);
			
            ?>
            <p style="margin-top: 24px;">Lütfen bilgisayarınızdan bir dosya seçiniz ve 'Yükle' düğmesine basınız.</p>
            <fieldset>
                <div class="control-group" style="height: 200px;">
                    <label for="fileInput" class="control-label">File Input</label>
                    <div class="controls">
                        <input type="file" id="fileInput" name="userfile" class="input-file uniform_on">
						<input type="submit" value="upload" />
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" type="submit">Yükle</button>
                    <button class="btn" type="submit" name="submit" value="Cancel">İptal</button>
                </div>
            </fieldset>
            </form>

        </div>
		
		
        </div>
    </div>
    
</div>

<!-- BITIS -->
</div>
