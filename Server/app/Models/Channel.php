<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Reason;

class Channel extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function reasons()
    {
        return $this->hasMany(Reason::class, 'channel_id');
    }
}
