<?php

namespace App\Http\Controllers;

use App\Models\FileLog;
use App\Models\TicketRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tickets = TicketRequest::with(['sender'])
            ->where('receiver_id', $user->id)
            ->where('status', 'approved')
            ->where('is_uploaded', false)
            ->get();

        return Inertia::render('Tickets/Upload', [
            'tickets' => $tickets
        ]);
    }

    public function upload(Request $request, $id)
    {
        $ticket = TicketRequest::findOrFail($id);
        $user = $request->user();

        \Illuminate\Support\Facades\Gate::authorize('upload', $ticket);

        $request->validate([
            'file' => 'required|file|max:20480',
        ]);

        DB::beginTransaction();
        try {
            $uploadedFile = $request->file('file');
            
            $ticket->update([
                'uploaded_file_path' => $uploadedFile->getClientOriginalName(),
                'file_data' => \Illuminate\Support\Facades\Crypt::encrypt(file_get_contents($uploadedFile->getRealPath())),
                'mime_type' => $uploadedFile->getMimeType(),
                'file_size' => $uploadedFile->getSize(),
                'is_uploaded' => true,
                'status' => 'closed',
                'secure_token' => \Illuminate\Support\Str::random(64),
            ]);

            FileLog::create([
                'request_id' => $ticket->id,
                'request_type' => 'ticket_request',
                'action' => 'upload',
                'user_type' => $user->role,
                'user_id' => $user->id
            ]);

            DB::commit();
            return back()->with('success', 'File uploaded and ticket closed.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Upload failed.');
        }
    }
}
