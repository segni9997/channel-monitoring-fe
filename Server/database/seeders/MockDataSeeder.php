<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Branch;
use App\Models\Atm;
use App\Models\Channel;
use App\Models\Reason;
use App\Models\Department;
use App\Models\Incident;
use App\Models\Incident_User_;
use App\Models\Shift;
use App\Models\SystemLog;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Hash;

class MockDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Departments
        $departments = Department::factory()->count(5)->create();

        // 2. Create Branches and ATMs
        $branches = Branch::factory()->count(10)->create()->each(function ($branch) {
            Atm::factory()->count(rand(2, 5))->create([
                'branch_id' => $branch->id,
            ]);
        });

        // 3. Create Channels and Reasons
        $channelNames = ['USSD', 'APP', 'ATM', 'IPS', 'TOPUP', 'IBANK', 'LOROIB'];
        foreach ($channelNames as $name) {
            $channel = Channel::firstOrCreate(['name' => $name]);
            Reason::factory()->count(rand(3, 8))->create([
                'channel_id' => $channel->id,
            ]);
        }

        // 4. Create Users
        $users = User::factory()->count(20)->create();
        
        // Ensure we have a known admin for testing
        if (!User::where('email', 'admin@test.com')->exists()) {
            User::create([
                'firstName' => 'Admin',
                'lastName' => 'Test',
                'phoneNumber' => '0912345678',
                'role' => 'admin',
                'is_active' => true,
                'email' => 'admin@test.com',
                'password' => Hash::make('password'),
            ]);
        }

        // 5. Create Shifts
        Shift::factory()->count(15)->create();

        // 6. Create Incidents
        $reasons = Reason::all();
        $atms = Atm::all();

        Incident::factory()->count(50)->create()->each(function ($incident) use ($users, $reasons, $branches, $atms) {
            $incident->createdBy = $users->random()->id;
            $incident->reasonId = $reasons->random()->id;
            
            // If it's an ATM incident, assign branch and atm
            if ($incident->channel === 'ATM') {
                $atm = $atms->random();
                $incident->atm_id = $atm->id;
                $incident->branch_id = $atm->branch_id;
            } else {
                $incident->branch_id = $branches->random()->id;
                $incident->atm_id = null;
            }
            
            $incident->save();

            // 7. Create Incident Users (Pivot)
            Incident_User_::create([
                'incidentId' => $incident->id,
                'userId' => $users->random()->id,
                'involvement' => collect(['reporter', 'resolver', 'both'])->random(),
            ]);
        });

        // 8. Create System Logs
        SystemLog::factory()->count(30)->create([
            'user_id' => $users->random()->id,
        ]);

        // 9. Create System Settings
        SystemSetting::factory()->count(10)->create();
    }
}
