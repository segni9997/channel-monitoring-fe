<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Reason;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'createdBy',
        'downTimeStart',
        'downTimeEnd',
        'duration',
        'remark',
        'status',
        'channel',
        'reasonId',
        'branch_id',
        'atm_id',
    ];

    /*
    |----------------------------------
    | Relationships
    |----------------------------------
    */

    // The user who created the incident
    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    // Reason relationship
    public function reason()
    {
        return $this->belongsTo(Reason::class, 'reasonId');
    }

    // Branch relationship
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    // ATM relationship
    public function atm()
    {
        return $this->belongsTo(Atm::class, 'atm_id');
    }

    // Users involved in this incident (many-to-many if you kept pivot)
    public function users()
    {
        return $this->belongsToMany(User::class, 'incident__user')
                    ->withPivot('involvement')
                    ->withTimestamps();
    }
}