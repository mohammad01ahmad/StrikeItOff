import { supabase } from '../../../lib/supabase';
import { ApiResponse, successResponse, errorResponse } from '../../utils/apiResponse/apiResponse';

export async function updateProfile(firstName: string, lastName: string): Promise<ApiResponse<undefined>> {
  try {

    // find the user from users table
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse('No active session found.', 401);

    // update the new fields of the user found (DB)
    const { data: updatedRow, error: dbError } = await supabase
      .from('users')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (dbError) return errorResponse(dbError.message, 400);
    if (!updatedRow) return errorResponse('Profile did not update, no row was written', 400);

    // update auth (user.metadata) for UI changes
    const { error: metaError } = await supabase.auth
      .updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim()
        }
      });
    if (metaError) return errorResponse(metaError.message);

    return successResponse('Profile updated successfully', updatedRow, 200);
  } catch (err: any) {
    return errorResponse(err?.message ?? 'Unexpected error', 500);
  }
}
