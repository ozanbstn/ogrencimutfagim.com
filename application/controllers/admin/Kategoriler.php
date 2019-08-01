<?php
class Kategoriler extends CI_Controller {

        public function __construct()
        {
                parent::__construct();
                // Your own constructor code
				$this->load->database(); // Sayfada veritabanına erişmemizi saglar
				$this->load->model('Database_Model'); // model tanımlaması
				$this->load->library("session");
				$this->load->helper(array('form','url'));
		}

public function index()
	{
		
		$query=$this->db->get("kategoriler"); 
        $data["veri"]=$query->result(); 
		
		$data["title"]="Kategori Listeleme Sayfası";
		
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/kategori_listesi',$data);
		$this->load->view('admin/footer');
	}

public function kategori_ekle()
{
	
		
	$data["title"]="Kategori Ekleme Sayfası";
	$this->load->view('admin/header',$data);
	$this->load->view('admin/sidebar');
	$this->load->view('admin/kategori_ekle');
	$this->load->view('admin/footer');
}	
	
public function kaydet()
{
		
	$data=array(
		'adi' => $this->input->post('adi'),
		'aciklama' => $this->input->post('aciklama'),
		'keywords' => $this->input->post('keywords')
		);
		
		$this->Database_Model->insert_data("kategoriler",$data);
		redirect(base_url()."admin/kategoriler");
}	
	
public function kategori_sil($Id)
{
	$this->db->query('DELETE FROM kategoriler WHERE Id='.$Id);
	redirect(base_url()."admin/kategoriler");
}

public function kategori_duzenle($id)
	{
	    $query = $this->db->get_where("kategoriler",array("Id"=>$id)); 
        $data['veri'] = $query->result(); 
        $data["title"]="Kategori Düzenleme Sayfası";
		
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/kategori_duzenle',$data);
		$this->load->view('admin/footer');
	       	
	
	}
public function guncelle($id)
	{
		
	    $data=array(
		'adi' => $this->input->post('adi'),
		'aciklama' => $this->input->post('aciklama'),
		'keywords' => $this->input->post('keywords')
		);
		$this->Database_Model->update_data("kategoriler",$data,$id);
		
		redirect(base_url()."admin/kategoriler");
		
		
	}	
	
public function resimekle($id)
	{
		$sorgu=$this->db->query("SELECT * FROM yemekler WHERE id=$id");
	     $data["veri"]=$sorgu->result();
		
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/yemek_resim',$data);
		$this->load->view('admin/footer');
	}
	
    public function resim_upload($id)
	
	{
		
		$config['upload_path']          = './uploads/';
        $config['allowed_types']        = 'gif|jpg|png';
        $config['max_size']             = 1024;
        $config['max_width']            = 1024;
        $config['max_height']           = 768;
		
		$this->load->library('upload', $config); 
		
		if ( ! $this->upload->do_upload('userfile'))
                {
                        $error = array('error' => $this->upload->display_errors());
                        $this->session->set_flashdata("sonuc","Upload hatası".$error );
                        redirect(base_url()."admin/yemekler/resimekle/$id");
                }
                else
                {
                          $data=array(
		                'yemekresim' => $this->input->post('file_name')
		               );
		               $this->Database_Model->update_data("yemekler",$data,$id); 
                        $this->session->set_flashdata("sonuc","Resim Upload Edildi" );
						redirect(base_url()."admin/yemekler");
						
                }						
		
	}

		
	
	
} // Main
?>