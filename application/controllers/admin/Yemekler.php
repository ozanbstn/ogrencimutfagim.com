<?php
class Yemekler extends CI_Controller {

        public function __construct()
        {
                parent::__construct();
                // Your own constructor code
				$this->load->database(); // Sayfada veritabanına erişmemizi saglar
				$this->load->model('Database_Model'); // model tanımlaması
				$this->load->library("session");
				$this->load->helper('form');
				$this->load->helper('url');
		}

public function index()
	{
		
		$sql="SELECT kategoriler.adi as katadi, yemekler.* FROM yemekler
               LEFT JOIN kategoriler ON yemekler.kategori_id=kategoriler.Id
			   ORDER BY yemekler.adi";
		
		$query=$this->db->query($sql); 
        $data["veri"]=$query->result(); 
		
		$data["title"]="Yemek Listeleme Sayfası";
		
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/yemek_listesi',$data);
		$this->load->view('admin/footer');
	}

public function ekle()
{
	$query=$this->db->get("kategoriler"); 
    $data2["veri"]=$query->result(); 
		
	$data["title"]="Yemek Ekleme Sayfası";
	$this->load->view('admin/header');
	$this->load->view('admin/sidebar');
	$this->load->view('admin/yemek_ekle',$data2);
	$this->load->view('admin/footer');
}	
	
public function kaydet()
{
		
	$data=array(
		'adi' => $this->input->post('adi'),
		'kategori_id' => $this->input->post('kategori_id'),
		'malzemeler' => $this->input->post('malzemeler'),
		'tarif' => $this->input->post('tarif')
		);
		
		$this->Database_Model->insert_data("yemekler",$data);
		redirect(base_url()."admin/yemekler");
}	
	
public function sil($id)
{
	$this->db->query('DELETE FROM yemekler WHERE id='.$id);
	redirect(base_url()."admin/yemekler");
}

public function duzenle($id)
	{
	   $result = $this->Database_Model->get_tarif($id);
    if ($result){

	     $sorgu=$this->db->query("SELECT * FROM kategoriler ORDER BY adi");
		 $data["kategoriler"]=$sorgu->result();
	
	
	
	    $data['veri'] = $result; 
        $data["title"]="Tarif Düzenleme Sayfası";
		
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/yemek_duzenle',$data);
		$this->load->view('admin/footer');
	       }	
	else {
		redirect(base_url()."admin/yemekler");
	}
	}
public function guncelle($id)
	{
		
	    $data=array(
		'adi' => $this->input->post('adi'),
		'kategori_id' => $this->input->post('kategori_id'),
		'malzemeler' => $this->input->post('malzemeler'),
		'tarif' => $this->input->post('tarif'),
		);
		$this->Database_Model->update_data("yemekler",$data,$id);
		$this->session->set_flashdata("sonuc","Kayıt Güncelleme Başarıyla Gerçekleşti!");
		redirect(base_url()."admin/yemekler");
		
	}	
	
public function resimekle($id)
	{
		 
        $data["title"]="Tarif Düzenleme Sayfası";
		
		$sorgu=$this->db->query("SELECT * FROM yemekler WHERE id=$id");
	     $data["veri"]=$sorgu->result();
		
		$this->load->view('admin/header');
		$this->load->view('admin/sidebar');
		$this->load->view('admin/yemek_resim',$data);
		$this->load->view('admin/footer');
	}
	
   
	public function do_upload($id)
    {
        $config['upload_path']          = './uploads/';
        $config['allowed_types']        = 'gif|jpg|png';
        $config['max_size']             = 10000;
        $config['max_width']            = 5000;
        $config['max_height']           = 5000;
		
        $this->load->library('upload', $config);
				
        if (!$this->upload->do_upload('userfile'))
          {
            $error = array('error' => $this->upload->display_errors());
            $this->session->set_flashdata("sonuc","Upload Hatası".$error);
            redirect(base_url()."admin/yemekler/resimekle/".$id);
			//echo "hata"; die();
          }
        else
          {
            $data=array(
                'yemekresim'=> $this->upload->data('file_name'),
            );
            $this->Database_Model->update_data("yemekler",$data,$id);
            $this->session->set_flashdata("sonuc","Resim Upload Edildi.");
            redirect(base_url()."admin/yemekler");
           }
    }
	
	
	
} // Main
?>